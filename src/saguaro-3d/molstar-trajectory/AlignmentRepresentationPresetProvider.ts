/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    StructureRepresentationPresetProvider
} from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StateObjectRef } from 'molstar/lib/mol-state';
import {
    StructureElement,
    StructureProperties as SP
} from 'molstar/lib/mol-model/structure';

import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { createSelectionExpressions } from '@rcsb/rcsb-molstar/build/src/viewer/helpers/selection';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';

import { TagDelimiter } from '@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter';
import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;

import { StructureBuilder } from 'molstar/lib/mol-plugin-state/builder/structure';
import { StructureRepresentationBuilder } from 'molstar/lib/mol-plugin-state/builder/structure/representation';
import { StateTransform } from 'molstar/lib/mol-state/transform';
import {
    RigidTransformType
} from '@rcsb/rcsb-saguaro-3d/lib/RcsbFvStructure/StructureUtils/StructureLoaderInterface';
import { CLOSE_RESIDUE_COLOR } from './Coloring';
import updateFocusRepr = StructureRepresentationPresetProvider.updateFocusRepr;
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';

type RepresentationParamsType = {
    pdb: { entryId: string; instanceId: string; };
    transform: RigidTransformType[]|undefined;
}

type ComponentType = Awaited<ReturnType<InstanceType<typeof StructureBuilder>['tryCreateComponentFromExpression']>>;
type RepresentationType = ReturnType<InstanceType<typeof StructureRepresentationBuilder>['buildRepresentation']>;
type ComponentMapType = Record<string, ComponentType>;
type RepresentationMapType = Record<string, RepresentationType>;

export const AlignmentRepresentationProvider = StructureRepresentationPresetProvider({
    id: 'alignment-to-reference',
    display: {
        name: 'Alignment to Reference'
    },
    isApplicable: (): boolean => true,
    params: () => ({
        pdb: PD.Value<{ entryId: string; instanceId: string; }>(Object.create(null)),
        transform: PD.Value<RigidTransformType[] | undefined>(undefined)
    }),
    apply: async (structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, params: RepresentationParamsType, plugin: PluginContext) => {
        const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, structureRef);
        if (!structureCell)
            return {};

        const structure = structureCell.obj?.data;
        if (!structure)
            return {};

        const entryId = params.pdb?.entryId;
        if (!entryId)
            return {};

        const instanceId = params.pdb.instanceId;
        const l = StructureElement.Location.create(structure);

        const componentMap: ComponentMapType = {};
        const representationMap: RepresentationMapType = {};
        // find the aligned chain
        structure.units.find(unit => {
            StructureElement.Location.set(l, structure, unit, unit.elements[0]);
            return SP.chain.label_asym_id(l) === instanceId;
        });
        const alignedEntityId = SP.chain.label_entity_id(l);
        const alignedAsymId = SP.chain.label_asym_id(l);
        const alignedOperatorName = SP.unit.operator_name(l);
        const alignedType = SP.entity.type(l);
        const alignedOperators: string[] = SP.unit.pdbx_struct_oper_list_ids(l);
        if (alignedOperators.length === 0) alignedOperators.push('0');
        if (alignedType !== 'polymer')
            return {};
        if (alignedAsymId && alignedOperatorName)
            structure.inheritedPropertyData.colorConfig.setUniqueChain(structure.model.id, alignedAsymId, alignedOperatorName);

        const alignedChainComp = await plugin.builders.structure.tryCreateComponentFromExpression(
            structureCell,
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.logic.and([
                    MS.core.rel.eq([MS.ammp('label_asym_id'), alignedAsymId]),
                    MS.core.rel.eq([MS.acp('operatorName'), alignedOperatorName])
                ])
            }),
            `${structureCell.transform.ref}-aligned`,
            {
                label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.assembly}${alignedOperators.join(',')}${TagDelimiter.assembly}${alignedType}`
            }
        );
        componentMap['aligned'] = alignedChainComp;
        representationMap['aligned'] = await buildRepr(plugin, alignedChainComp, 'cartoon');

        const expressions = [];
        const asymObserved: { [key: string]: boolean } = {};
        // find non-aligned polymer chains
        for (const unit of structure.units) {
            StructureElement.Location.set(l, structure, unit, unit.elements[0]);
            const asymId = SP.chain.label_asym_id(l);
            const operatorName = SP.unit.operator_name(l);
            if (asymId === alignedAsymId && operatorName === alignedOperatorName)
                continue;
            if (asymObserved[`${asymId}${TagDelimiter.assembly}${operatorName}`])
                continue;
            asymObserved[`${asymId}${TagDelimiter.assembly}${operatorName}`] = true;
            const type = SP.entity.type(l);
            if (type === 'polymer') {
                expressions.push(MS.core.logic.and([
                    MS.core.rel.eq([MS.ammp('label_asym_id'), asymId]),
                    MS.core.rel.eq([MS.acp('operatorName'), operatorName])
                ]));
            }
        }
        const compId = `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${alignedType}`;
        const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
            structureCell,
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.logic.or(expressions)
            }),
            `${structureCell.transform.ref}-polymer`,
            {
                label: compId
            }
        );
        componentMap['polymer'] = comp;
        representationMap['polymer'] = await buildRepr(plugin, comp, 'cartoon', { isHidden: true });

        for (const expression of createSelectionExpressions(entryId)) {
            if (expression.tag === 'polymer')
                continue;
            const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                structureCell,
                expression.expression,
                `${structureCell.transform.ref}-${expression.tag}`,
                {
                    label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${expression.tag}`
                });
            componentMap[expression.tag] = comp;
            representationMap[expression.tag] = await buildRepr(plugin, comp, expression.type, { isHidden: true });

        }

        await updateFocusRepr(plugin, structure, CLOSE_RESIDUE_COLOR, {});

        return {
            components: componentMap,
            representations: representationMap
        };
    }
});

export async function buildRepr(plugin: PluginContext, comp: ComponentType, type: StructureRepresentationRegistry.BuiltIn, initialState?: { isHidden: boolean; }) {
    const { update, builder } = reprBuilder(plugin, {
        ignoreHydrogens: true,
        ignoreLight: false,
        quality: 'auto'
    });
    const repr = builder.buildRepresentation(update, comp, {
        color: CLOSE_RESIDUE_COLOR,
        type
    }, {
        initialState
    });
    if (comp?.cell?.state) {
        StateTransform.assignState(comp?.cell?.state, { isHidden: initialState?.isHidden });
    }
    await update.commit({ revertOnError: false });
    return repr;
}

