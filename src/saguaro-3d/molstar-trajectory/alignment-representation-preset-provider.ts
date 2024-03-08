/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
* @author Yana Rose <yana.rose@rcsb.org>
*/
import { StructureRepresentationPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StateObjectRef } from 'molstar/lib/mol-state';
import {
    StructureElement as SE,
    StructureProperties as SP
} from 'molstar/lib/mol-model/structure';

import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { createSelectionExpressions } from '@rcsb/rcsb-molstar/build/src/viewer/helpers/selection';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';

import { TagDelimiter } from '@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter';
import { StructureBuilder } from 'molstar/lib/mol-plugin-state/builder/structure';
import { StructureRepresentationBuilder } from 'molstar/lib/mol-plugin-state/builder/structure/representation';
import { StateTransform } from 'molstar/lib/mol-state/transform';
import { RigidTransformType } from '@rcsb/rcsb-saguaro-3d/lib/RcsbFvStructure/StructureUtils/StructureLoaderInterface';
import { STRUCTURAL_ALIGNMENT_CLOSE_RESIDUE_COLOR, STRUCTURAL_ALIGNMENT_HOMOGENOUS_COLOR } from './alignment-color-theme';

import { StructureRepresentationRegistry } from 'molstar/lib/mol-repr/structure/registry';

type RepresentationParamsType = {
    pdb: {
        entryId: string
        instanceId: string
    };
    transform: RigidTransformType[] | undefined;
}

type ComponentType = Awaited<ReturnType<InstanceType<typeof StructureBuilder>['tryCreateComponentFromExpression']>>;
type RepresentationType = ReturnType<InstanceType<typeof StructureRepresentationBuilder>['buildRepresentation']>;

import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;
import updateFocusRepr = StructureRepresentationPresetProvider.updateFocusRepr;
import { AlignemntDataDescriptor } from './alignment-data-descriptor';
import { ColorTheme } from 'molstar/lib/mol-theme/color';

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

        let alignedEntityId;
        let alignedOperators = [];

        const l = SE.Location.create();
        const instanceId = params.pdb.instanceId;
        const isIdentityMap = structure.inheritedPropertyData.rcsb_alignmentIsIdentityMap as Map<number, boolean>;

        const expressionsAlignedChain = [];
        const expressionsOtherPolymerChains = [];
        for (const unit of structure.units) {
            SE.Location.set(l, structure, unit, unit.elements[0]);
            const type = SP.entity.type(l);
            const asymId = SP.chain.label_asym_id(l);
            if (asymId === instanceId && isIdentityMap?.get(unit.id)) {
                alignedEntityId = SP.chain.label_entity_id(l);
                alignedOperators = SP.unit.pdbx_struct_oper_list_ids(l);
                if (alignedOperators.length === 0) alignedOperators.push('0');
                expressionsAlignedChain.push(MS.core.rel.eq([MS.ammp('label_asym_id'), asymId]));
                expressionsAlignedChain.push(AlignemntDataDescriptor.symbols.isIdentityUnit.symbol());
            } else if (type === 'polymer') {
                if (asymId === instanceId) {
                    // aligned chain ID partner needs an additinal 'idenity' check
                    const e = MS.core.logic.and([
                        MS.core.rel.eq([MS.ammp('label_asym_id'), asymId]),
                        MS.core.logic.not([AlignemntDataDescriptor.symbols.isIdentityUnit.symbol()])
                    ]);
                    expressionsOtherPolymerChains.push(e);
                } else {
                    expressionsOtherPolymerChains.push(MS.core.rel.eq([MS.ammp('label_asym_id'), asymId]));
                }
            }
        }

        const components: Record<string, ComponentType> = {};
        const representations: Record<string, RepresentationType> = {};

        // create a component for aligned polymer chain
        const alignedChainComponent = await plugin.builders.structure.tryCreateComponentFromExpression(
            structureCell,
            MS.struct.generator.atomGroups({
                'chain-test': MS.core.logic.and(expressionsAlignedChain)
            }),
            `${structureCell.transform.ref}-aligned`,
            {
                // NOTE: this label format is needed for show/hide boxes in 1D view to work
                label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${instanceId}-${alignedOperators.join(',')}-polymer`
            }
        );
        components['aligned'] = alignedChainComponent;
        representations['aligned'] = await buildRepr(plugin, alignedChainComponent, 'cartoon', STRUCTURAL_ALIGNMENT_HOMOGENOUS_COLOR);

        // creare component for other polymer chains
        if (expressionsOtherPolymerChains.length > 0) {
            const polymerChainsComponent = await plugin.builders.structure.tryCreateComponentFromExpression(
                structureCell,
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.logic.or(expressionsOtherPolymerChains)
                }),
                `${structureCell.transform.ref}-polymer`,
                {
                    // NOTE: this label format is needed for show/hide boxes in 1D view to work
                    label: `${entryId}${TagDelimiter.entity}${alignedEntityId}-polymer`
                }
            );
            components['polymer'] = polymerChainsComponent;
            representations['polymer'] = await buildRepr(plugin, polymerChainsComponent, 'cartoon', STRUCTURAL_ALIGNMENT_HOMOGENOUS_COLOR);
        }

        for (const expression of createSelectionExpressions(entryId)) {
            if (expression.tag === 'polymer')
                continue;
            const nonPolymersComponent = await plugin.builders.structure.tryCreateComponentFromExpression(
                structureCell,
                expression.expression,
                `${structureCell.transform.ref}-${expression.tag}`,
                {
                    label: `${entryId}${TagDelimiter.entity}${alignedEntityId}-${expression.tag}`
                });
            components[expression.tag] = nonPolymersComponent;
            representations[expression.tag] = await buildRepr(plugin, nonPolymersComponent, expression.type, STRUCTURAL_ALIGNMENT_CLOSE_RESIDUE_COLOR, { isHidden: true });
        }

        await updateFocusRepr(plugin, structure, STRUCTURAL_ALIGNMENT_CLOSE_RESIDUE_COLOR, {});

        return {
            components: components,
            representations: representations
        };
    }
});

export async function buildRepr(plugin: PluginContext, comp: ComponentType, type: StructureRepresentationRegistry.BuiltIn, color: ColorTheme.BuiltIn, initialState?: { isHidden: boolean; }) {
    const { update, builder } = reprBuilder(plugin, {
        ignoreHydrogens: true,
        ignoreLight: false,
        quality: 'auto'
    });
    const repr = builder.buildRepresentation(update, comp, {
        color,
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

