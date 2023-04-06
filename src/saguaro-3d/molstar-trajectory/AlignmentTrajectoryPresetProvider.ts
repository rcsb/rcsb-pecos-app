/*
* Copyright (c) 2021 RCSB PDB and contributors, licensed under MIT, See LICENSE file for more info.
* @author Joan Segura Mora <joan.segura@rcsb.org>
*/

import { TrajectoryHierarchyPresetProvider } from 'molstar/lib/mol-plugin-state/builder/structure/hierarchy-preset';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { PluginStateObject } from 'molstar/lib/mol-plugin-state/objects';
import { ParamDefinition, ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { StateObjectRef } from 'molstar/lib/mol-state';
import { RootStructureDefinition } from 'molstar/lib/mol-plugin-state/helpers/root-structure';
import { StateObject } from 'molstar/lib/mol-state/object';

import { Structure, StructureElement, StructureProperties as SP } from 'molstar/lib/mol-model/structure';
import {
    RigidTransformType
} from '@rcsb/rcsb-saguaro-3d/lib/RcsbFvStructure/StructureUtils/StructureLoaderInterface';
import { representationPresetProvider } from './AlignmentRepresentationPresetProvider';
import { ColorConfig } from '../ExternalAlignmentProvider';


export type AlignmentTrajectoryParamsType = {
    pdb?: {entryId: string;entityId: string;}|{entryId: string;instanceId: string;};
    transform?: RigidTransformType[];
    modelIndex?: number;
    targetAlignment: undefined;
}

export function getTrajectoryPresetProvider(alignmentId: string, colorConfig: ColorConfig) {
    return TrajectoryHierarchyPresetProvider({
        id: 'alignment-to-reference',
        display: {
            name: 'Alignment to Reference'
        },
        isApplicable: (trajectory: PluginStateObject.Molecule.Trajectory, plugin: PluginContext): boolean => true,
        params: (trajectory: PluginStateObject.Molecule.Trajectory | undefined, plugin: PluginContext): ParamDefinition.For<AlignmentTrajectoryParamsType> => ({
            pdb: PD.Value<{entryId: string;entityId: string;}|{entryId: string;instanceId: string;}|undefined>(undefined),
            modelIndex: PD.Value<number|undefined>(undefined),
            transform: PD.Value<RigidTransformType[]|undefined>(undefined),
            targetAlignment: PD.Value<undefined>(undefined)
        }),
        apply: async (trajectory: StateObjectRef<PluginStateObject.Molecule.Trajectory>, params: AlignmentTrajectoryParamsType, plugin: PluginContext) => {
            if (!params.pdb)
                return {};
            const modelParams = { modelIndex: params.modelIndex || 0 };
            const builder = plugin.builders.structure;

            const model = await builder.createModel(trajectory, modelParams);
            const modelProperties = await builder.insertModelProperties(model);
            let structure;
            let assemblyId = 1;
            let entityCheck = false;

            do {
                const structureParams: RootStructureDefinition.Params = {
                    name: 'assembly',
                    params: { id: (assemblyId++).toString() }
                };
                structure = await builder.createStructure(modelProperties || model, structureParams);
                const cell = structure.cell;
                if (cell) {
                    const units = structure.cell?.obj?.data.units;
                    const strData: Structure = (cell.obj as StateObject<Structure>).data;
                    if (units) {
                        const l = StructureElement.Location.create(strData);
                        for (const unit of units) {
                            StructureElement.Location.set(l, strData, unit, unit.elements[0]);
                            entityCheck = (SP.chain.label_entity_id(l) === ('entityId' in params.pdb ? params.pdb.entityId : undefined) || SP.chain.label_asym_id(l) === ('instanceId' in params.pdb ? params.pdb.instanceId : undefined));
                            if (entityCheck)
                                break;
                        }
                    }
                }
                if (!entityCheck)
                    plugin.managers.structure.hierarchy.remove([
                        plugin.managers.structure.hierarchy.current.structures[plugin.managers.structure.hierarchy.current.structures.length - 1]
                    ]);
            } while (!entityCheck);
            if (structure.data?.model.id)
                colorConfig.setAlignmentIdToModel(structure.data?.model.id, alignmentId);
            const structureProperties = await builder.insertStructureProperties(structure);
            const representation = await plugin.builders.structure.representation.applyPreset(
                structureProperties,
                representationPresetProvider(alignmentId, colorConfig),
                {
                    pdb: params.pdb,
                    transform: params.transform
                }
            );
            // TODO what is the purpose of this return?
            return {
                model,
                modelProperties,
                structure,
                structureProperties,
                representation
            };
        }
    });
}