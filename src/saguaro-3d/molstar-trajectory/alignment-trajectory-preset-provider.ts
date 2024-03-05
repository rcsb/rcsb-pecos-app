/* eslint-disable @typescript-eslint/no-unused-vars */
/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
* @author Yana Rose <yana.rose@rcsb.org>
*/
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { RootStructureDefinition } from 'molstar/lib/mol-plugin-state/helpers/root-structure';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';

import { Model } from 'molstar/lib/mol-model/structure';
import {
    RigidTransformType, TransformMatrixType
} from '@rcsb/rcsb-saguaro-3d/lib/RcsbFvStructure/StructureUtils/StructureLoaderInterface';
import { AlignmentRepresentationProvider } from './alignment-representation-preset-provider';
import { AlignemntDataDescriptor } from './alignment-data-descriptor';
import { ModelSymmetry } from 'molstar/lib/mol-model-formats/structure/property/symmetry';
import { TrajectoryHierarchyPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset';
import { TransformStructureConformation } from 'molstar/lib/mol-plugin-state/transforms/model';
import { FlexibleAlignmentBuiltIn } from './alignment-flexible-built-in';
import { ModelExport } from 'molstar/lib/extensions/model-export/export';
import { StructureSelectionQuery } from 'molstar/lib/mol-plugin-state/helpers/structure-selection-query';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { Mat4 } from 'molstar/lib/mol-math/linear-algebra/3d/mat4';
import { CloseResidues } from '../alignment-reference';

export type AlignmentTrajectoryParamsType = {
    pdb: {
        entryId: string
        instanceId: string
    };
    transform: RigidTransformType[];
    modelIndex: number;
    targetAlignment: undefined;
    alignmentId: string;
}

export const AlignmentTrajectoryPresetProvider = TrajectoryHierarchyPresetProvider({
    id: 'alignment-to-reference',
    display: {
        name: 'Alignment to Reference'
    },
    isApplicable: (): boolean => true,
    params: (): PD.For<AlignmentTrajectoryParamsType> => ({
        pdb: PD.Value<{entryId: string; instanceId: string;}>(Object.create(null)),
        modelIndex: PD.Value<number>(0),
        transform: PD.Value<RigidTransformType[]>([]),
        targetAlignment: PD.Value<undefined>(undefined),
        alignmentId: PD.Value<string>('')
    }),
    apply: async (trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>, params: AlignmentTrajectoryParamsType, plugin: PluginContext) => {

        const modelParams = { modelIndex: params.modelIndex || 0 };
        const builder = plugin.builders.structure;

        const model = await builder.createModel(trajectory, modelParams);
        if (!model.data)
            return {};
        const modelProperties = await builder.insertModelProperties(model);
        const structureParams: RootStructureDefinition.Params = {
            name: 'assembly',
            params: { id: findAssembly(model.data, params.pdb.instanceId) }
        };
        let structure = await builder.createStructure(modelProperties || model, structureParams);

        const isIdentityMap = new Map<number, boolean>();
        const isFlexibleAlignment = params.transform?.length > 1;
        if (isFlexibleAlignment) {
            plugin.managers.structure.hierarchy.remove([
                plugin.managers.structure.hierarchy.current.structures[plugin.managers.structure.hierarchy.current.structures.length - 1]
            ]);
            structure = await plugin.state.data.build().to(modelProperties).apply(FlexibleAlignmentBuiltIn, {
                pdb: params.pdb,
                transform: params.transform
            }).commit();
            structure.cell?.obj?.data.units.forEach(u => isIdentityMap.set(u.id, true));
        } else {
            const transformMatrix = params.transform?.[0].transform;
            const transformer = {
                transform: {
                    name: 'matrix' as const,
                    params: {
                        data: transformMatrix,
                        transpose: false
                    }
                }
            };
            const b = plugin.state.data.build().to(structure).insert(
                TransformStructureConformation,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                transformer as any,
                { tags: 'pairwise-matrix-alignment' }
            );
            const task = plugin.state.data.updateTree(b);
            structure = await plugin.runTask(task);

            structure.cell?.obj?.data.units.forEach(u => {
                const invAliTransform = Mat4.invert(Mat4(), Mat4.fromArray(Mat4(), transformMatrix, 0));
                const opMat = u.conformation.operator.matrix;
                const originalTransform = Mat4.mul(Mat4(), invAliTransform, opMat);
                const isIdentity = Mat4.isIdentity(originalTransform);
                isIdentityMap.set(u.id, isIdentity);
            });
        }

        if (!structure.data) return {};

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const alignmentData = ((plugin.customState as any).alignmentData as Map<string, CloseResidues>);
        structure.data.inheritedPropertyData.rcsb_alignmentModelIndex = params.modelIndex;
        structure.data.inheritedPropertyData.rcsb_alignmentCloseResidues = alignmentData.get(params.alignmentId);
        structure.data.inheritedPropertyData.rcsb_alignmentIsIdentityMap = isIdentityMap;

        const structureProperties = await builder.insertStructureProperties(structure);
        if (!structureProperties.data) return {};

        // Set a file name for user uploaded structures
        ModelExport.setStructureName(structureProperties.data, params.alignmentId);

        let representation = undefined;
        await plugin.state.data.transaction(async _ctx => {
            representation = await plugin.builders.structure.representation.applyPreset(
                structureProperties,
                AlignmentRepresentationProvider,
                {
                    pdb: params.pdb,
                    transform: params.transform
                }
            );

            await plugin.managers.structure.component.applyTheme({
                action: {
                    name: 'transparency',
                    // this is a minimal setting for selection to work
                    params: { value: 0.49 }
                },
                representations: ['cartoon'],
                selection: StructureSelectionQuery('close-residues', MS.struct.modifier.union([
                    MS.struct.generator.atomGroups({
                        'residue-test': MS.core.logic.not([AlignemntDataDescriptor.symbols.closeResidue.symbol()]),
                    })
                ])),
            });
        }).run();

        return {
            model,
            modelProperties,
            structure,
            structureProperties,
            representation
        };
    }
});

export function findAssembly(model: Model, instanceId: string): string {
    for (const assembly of ModelSymmetry.Provider.get(model)?.assemblies ?? []) {
        for (const operatorGroup of assembly.operatorGroups) {
            for (const asymId of operatorGroup.asymIds ?? []) {
                if (asymId === instanceId)
                    return assembly.id;
            }
        }
    }
    return '1';
}
