/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
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
import { AlignmentRepresentationProvider } from './AlignmentRepresentationPresetProvider';
import { ColorConfig } from '../ExternalAlignmentProvider';
import { ModelSymmetry } from 'molstar/lib/mol-model-formats/structure/property/symmetry';
import { TrajectoryHierarchyPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset';
import { TransformStructureConformation } from 'molstar/lib/mol-plugin-state/transforms/model';
import { FlexibleAlignmentBuiltIn } from './FlexibleAlignmentBuiltIn';
import { ModelExport } from 'molstar/lib/extensions/model-export/export';

export type AlignmentTrajectoryParamsType = {
    pdb: {entryId: string;instanceId: string;};
    transform: RigidTransformType[];
    modelIndex: number;
    targetAlignment: undefined;
    alignmentId: string;
    colorConfig: ColorConfig;
}

export const AlignmentTrajectoryPresetProvider = TrajectoryHierarchyPresetProvider({
    id: 'alignment-to-reference',
    display: {
        name: 'Alignment to Reference'
    },
    isApplicable: (): boolean => true,
    params: (): PD.For<AlignmentTrajectoryParamsType> => ({
        pdb: PD.Value<{entryId: string;instanceId: string;}>(Object.create(null)),
        modelIndex: PD.Value<number>(0),
        transform: PD.Value<RigidTransformType[]>([]),
        targetAlignment: PD.Value<undefined>(undefined),
        alignmentId: PD.Value<string>(''),
        colorConfig: PD.Value<ColorConfig>(Object.create(null))
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
        if (params.transform?.length === 1 && params.transform?.[0].transform) {
            await matrixAlign(plugin, structure, params.transform?.[0].transform);
        } else if (params.transform?.length > 1) {
            plugin.managers.structure.hierarchy.remove([
                plugin.managers.structure.hierarchy.current.structures[plugin.managers.structure.hierarchy.current.structures.length - 1]
            ]);
            structure = await plugin.state.data.build().to(modelProperties).apply(FlexibleAlignmentBuiltIn, {
                pdb: params.pdb,
                transform: params.transform
            }).commit();
        }

        if (!structure.data)
            return {};
        if (!structure.data?.inheritedPropertyData.colorConfig)
            structure.data.inheritedPropertyData.colorConfig = params.colorConfig;
        if (structure.data?.model.id)
            structure.data.inheritedPropertyData.colorConfig.setAlignmentIdToModel(structure.data?.model.id.toString(), params.alignmentId);

        const structureProperties = await builder.insertStructureProperties(structure);
        if (!structureProperties.data) return {};

        // Set a file name for user uploaded structures
        ModelExport.setStructureName(structureProperties.data, params.alignmentId);

        const representation = await plugin.builders.structure.representation.applyPreset(
            structureProperties,
            AlignmentRepresentationProvider,
            {
                pdb: params.pdb,
                transform: params.transform
            }
        );
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
