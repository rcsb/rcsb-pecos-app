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
import { EQUIVALENT_RESIDUES_COLOR } from './alignment-color-theme';
import updateFocusRepr = StructureRepresentationPresetProvider.updateFocusRepr;
import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';

type RepresentationParamsType = {
    pdb: { entryId: string; instanceId: string; };
    transform: RigidTransformType[] | undefined;
}

type ComponentType = Awaited<ReturnType<InstanceType<typeof StructureBuilder>['tryCreateComponentFromExpression']>>;
type RepresentationType = ReturnType<InstanceType<typeof StructureRepresentationBuilder>['buildRepresentation']>;

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
        if (!structureCell) return {};

        const structure = structureCell.obj?.data;
        if (!structure) return {};

        const entryId = params.pdb?.entryId;
        if (!entryId) return {};

        const instanceId = params.pdb.instanceId;
        const l = StructureElement.Location.create(structure);

        const components: Record<string, ComponentType> = {};
        const representations: Record<string, RepresentationType> = {};

        // find the aligned chain
        structure.units.find(unit => {
            StructureElement.Location.set(l, structure, unit, unit.elements[0]);
            return SP.chain.label_asym_id(l) === instanceId;
        });
        const alignedEntityId = SP.chain.label_entity_id(l);
        const alignedAsymId = SP.chain.label_asym_id(l);

        const alignedOperators: string[] = SP.unit.pdbx_struct_oper_list_ids(l);
        if (alignedOperators.length === 0) alignedOperators.push('0');

        if (SP.entity.type(l) !== 'polymer')
            throw new Error('Aligned chain must by of type polimer');

        const alignedOperatorName = SP.unit.operator_name(l);
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
                label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${alignedAsymId}-${alignedOperators.join(',')}-polymer`
            }
        );
        components['aligned'] = alignedChainComp;
        representations['aligned'] = await buildRepr(plugin, alignedChainComp, 'cartoon');

        // find non-aligned polymer chains
        const expressions = [];
        const asymObserved: { [key: string]: boolean } = {};
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
        const compId = `${entryId}${TagDelimiter.entity}${alignedEntityId}-polymer`;
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
        components['polymer'] = comp;
        representations['polymer'] = await buildRepr(plugin, comp, 'cartoon', { isHidden: true });

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
            components[expression.tag] = comp;
            representations[expression.tag] = await buildRepr(plugin, comp, expression.type, { isHidden: true });

        }

        await updateFocusRepr(plugin, structure, EQUIVALENT_RESIDUES_COLOR, {});

        return {
            components: components,
            representations: representations
        };
    }
});

export async function buildRepr(plugin: PluginContext, comp: ComponentType, type: StructureRepresentationRegistry.BuiltIn, initialState?: { isHidden: boolean; }) {
    const { update, builder } = reprBuilder(plugin, {
        ignoreHydrogens: true,
        ignoreLight: false,
        quality: 'auto'
    });
    // const s = comp?.data;
    const repr = builder.buildRepresentation(update, comp, {
        color: EQUIVALENT_RESIDUES_COLOR,
        type,
        // typeParams: {
        //     alpha: s?.inheritedPropertyData.colorConfig.idMap.get(s.model.id) === undefined ? 0.2 : 1
        // }
    }, {
        initialState
    });
    if (comp?.cell?.state) {
        StateTransform.assignState(comp?.cell?.state, { isHidden: initialState?.isHidden });
    }
    await update.commit({ revertOnError: false });
    return repr;
}

