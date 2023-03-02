/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import {
    StructureRepresentationPresetProvider
} from 'molstar/lib/mol-plugin-state/builder/structure/representation-preset';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginStateObject, PluginStateTransform } from 'molstar/lib/mol-plugin-state/objects';
import { StateObjectRef, StateSelection, StateTransformer } from 'molstar/lib/mol-state';
import {
    Model,
    QueryContext, ResidueIndex,
    Structure,
    StructureElement,
    StructureProperties as SP,
    StructureSelection,
    Unit
} from 'molstar/lib/mol-model/structure';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import uniqid from 'uniqid';
import { PLDDTConfidenceColorThemeProvider } from 'molstar/lib/extensions/model-archive/quality-assessment/color/plddt';
import { ColorTheme } from 'molstar/lib/mol-theme/color';
import { createSelectionExpressions } from '@rcsb/rcsb-molstar/build/src/viewer/helpers/selection';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';

import { TagDelimiter } from '@rcsb/rcsb-saguaro-app';
import { TargetAlignment } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import reprBuilder = StructureRepresentationPresetProvider.reprBuilder;

import { StructureBuilder } from 'molstar/lib/mol-plugin-state/builder/structure';
import { StructureRepresentationBuilder } from 'molstar/lib/mol-plugin-state/builder/structure/representation';
import { StateTransform } from 'molstar/lib/mol-state/transform';
import { TransformMatrixType } from '@rcsb/rcsb-saguaro-3d/build/dist/RcsbFvStructure/StructureUtils/StructureLoaderInterface';
import { TransformStructureConformation } from '@rcsb/rcsb-saguaro-3d';
import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property';


type RepresentationParamsType = {
    pdb?: { entryId: string; entityId: string; } | { entryId: string; instanceId: string; };
    matrix?: TransformMatrixType;
    targetAlignment?: TargetAlignment;
}

let refParams: StructureAlignmentParamsType | undefined = undefined;

type ComponentType = Awaited<ReturnType<InstanceType<typeof StructureBuilder>['tryCreateComponentFromExpression']>>;
type RepresentationType = ReturnType<InstanceType<typeof StructureRepresentationBuilder>['buildRepresentation']>;
type ComponentMapType = Record<string, ComponentType>;
type RepresentationMapType = Record<string, RepresentationType>;

export function representationPresetProvider(residueColoring: CustomElementProperty<any>) {
    return StructureRepresentationPresetProvider({
        id: 'alignment-to-reference',
        display: {
            name: 'Alignment to Reference'
        },
        isApplicable: (structureRef: PluginStateObject.Molecule.Structure, plugin: PluginContext): boolean => true,
        params: (structureRef: PluginStateObject.Molecule.Structure | undefined, plugin: PluginContext) => ({
            pdb: PD.Value<{ entryId: string; entityId: string; } | { entryId: string; instanceId: string; } | undefined>(undefined),
            targetAlignment: PD.Value<TargetAlignment | undefined>(undefined),
            matrix: PD.Value<TransformMatrixType | undefined>(undefined),
            ...StructureRepresentationPresetProvider.CommonParams
        }),
        apply: async (structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, params: RepresentationParamsType, plugin: PluginContext) => {
            const structureCell = StateObjectRef.resolveAndCheck(plugin.state.data, structureRef);
            if (!structureCell)
                return {};

            const structure = structureCell.obj!.data;

            const entryId = params.pdb?.entryId;
            if (!entryId)
                return {};
            const entityId = params.pdb && 'entityId' in params.pdb ? params.pdb?.entityId : undefined;
            const instanceId = params.pdb && 'instanceId' in params.pdb ? params.pdb?.instanceId : undefined;
            const l = StructureElement.Location.create(structure);
            let alignedEntityId;
            let alignedAsymId;
            let alignedOperatorName;
            let alignedType;

            const componentMap: ComponentMapType = {};
            const representationMap: RepresentationMapType = {};

            for (const unit of structure.units) {
                StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                if (SP.chain.label_entity_id(l) === entityId || SP.chain.label_asym_id(l) === instanceId) {
                    alignedEntityId = SP.chain.label_entity_id(l);
                    alignedAsymId = SP.chain.label_asym_id(l);
                    alignedOperatorName = SP.unit.operator_name(l);
                    alignedType = SP.entity.type(l);
                    const alignedOperators: string[] = SP.unit.pdbx_struct_oper_list_ids(l);
                    if (alignedOperators.length === 0) alignedOperators.push('0');
                    if (alignedType !== 'polymer')
                        return {};
                    if (plugin.managers.structure.hierarchy.current.structures.length === 1) {
                        refParams = {
                            entryId: entryId,
                            labelAsymId: alignedAsymId,
                            operatorName: alignedOperatorName,
                            targetAlignment: params.targetAlignment!
                        };
                    }
                    if (params.matrix) {
                        await matrixAlign(plugin, structureRef, params.matrix);
                    }
                    const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                        structureCell,
                        MS.struct.generator.atomGroups({
                            'chain-test': MS.core.logic.and([
                                MS.core.rel.eq([MS.ammp('label_asym_id'), alignedAsymId]),
                                MS.core.rel.eq([MS.acp('operatorName'), alignedOperatorName])
                            ])
                        }),
                        uniqid(`${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.entity}${alignedOperators.join(',')}`),
                        {
                            label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.instance}${alignedAsymId}${TagDelimiter.assembly}${alignedOperators.join(',')}${TagDelimiter.assembly}${alignedType}`
                        }
                    );
                    componentMap['aligned'] = comp;

                    // TODO This needs to be called after tryCreateComponentFromExpression
                    const { update, builder } = reprBuilder(plugin, {
                        ignoreHydrogens: true,
                        ignoreLight: false,
                        quality: 'auto'
                    });
                    representationMap['aligned'] = builder.buildRepresentation(update, comp, {
                        color: residueColoring.propertyProvider.descriptor.name as ColorTheme.BuiltIn,
                        type: 'cartoon'
                    });

                    await update.commit({ revertOnError: false });
                    break;
                }
            }
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
            const compId = `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${alignedType}`;
            const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                structureCell,
                MS.struct.generator.atomGroups({
                    'chain-test': MS.core.logic.or(expressions)
                }),
                uniqid(compId),
                {
                    label: compId
                }
            );
            componentMap['polymer'] = comp;

            const { update, builder } = reprBuilder(plugin, {
                ignoreHydrogens: true,
                ignoreLight: false,
                quality: 'auto'
            });
            representationMap['polymer'] = builder.buildRepresentation(update, comp, {
                color: PLDDTConfidenceColorThemeProvider.isApplicable({ structure }) ? PLDDTConfidenceColorThemeProvider.name as ColorTheme.BuiltIn : 'chain-id',
                type: 'cartoon'
            }, {
                initialState: {
                    isHidden: true
                }
            });
            if (comp?.cell?.state) {
                StateTransform.assignState(comp?.cell?.state, { isHidden: true });
            }

            await update.commit({ revertOnError: false });

            let anyLigComp;
            for (const expression of createSelectionExpressions(entryId)) {
                if (expression.tag === 'polymer')
                    continue;
                const comp = await plugin.builders.structure.tryCreateComponentFromExpression(
                    structureCell,
                    expression.expression,
                    uniqid(`${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${expression.tag}`),
                    {
                        label: `${entryId}${TagDelimiter.entity}${alignedEntityId}${TagDelimiter.assembly}${expression.tag}`
                    });
                componentMap[expression.tag] = comp;
                // TODO This needs to be called after tryCreateComponentFromExpression
                const { update, builder } = reprBuilder(plugin, {
                    ignoreHydrogens: true,
                    ignoreLight: false,
                    quality: 'auto'
                });
                representationMap[expression.tag] = builder.buildRepresentation(update, comp, {
                    type: expression.type
                }, {
                    initialState: {
                        isHidden: true
                    }
                });

                if (comp?.cell?.state) {
                    StateTransform.assignState(comp?.cell?.state, { isHidden: true });
                }

                await update.commit({ revertOnError: false });
                if (comp && expression.tag !== 'water') anyLigComp = comp;
            }

            // await updateFocusRepr(plugin, structure, residueColoring.propertyProvider.label, params.theme?.focus?.params);

            return {
                components: componentMap,
                representations: representationMap
            };
        }
    });
}

type StructureAlignmentParamsType = {
    entryId: string;
    labelAsymId: string;
    operatorName: string;
    targetAlignment: TargetAlignment;
};

async function matrixAlign(plugin: PluginContext, structureRef: StateObjectRef<PluginStateObject.Molecule.Structure>, matrix: TransformMatrixType): Promise<void> {
    const trans = {
        transform: {
            name: 'matrix' as const,
            params: { data: matrix, transpose: false }
        }
    };
    const b = plugin.state.data.build().to(structureRef).insert(
        TransformStructureConformation,
        trans as any,
        { tags: 'pairwise-matrix-alignment' }
    );
    const task = plugin.state.data.updateTree(b);
    await plugin.runTask(task);

}
