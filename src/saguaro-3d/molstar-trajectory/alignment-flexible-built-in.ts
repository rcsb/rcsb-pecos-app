/* eslint-disable @typescript-eslint/no-unused-vars */
import { PluginStateObject as PSO, PluginStateTransform } from 'molstar/lib/mol-plugin-state/objects';
import { ParamDefinition as PD } from 'molstar/lib/mol-util/param-definition';
import { RigidTransformType } from '@rcsb/rcsb-saguaro-3d/lib/RcsbFvStructure/StructureUtils/StructureLoaderInterface';
import {
    Structure,
    StructureElement,
    StructureProperties as SP,
    StructureSelection
} from 'molstar/lib/mol-model/structure';
import { MolScriptBuilder as MS } from 'molstar/lib/mol-script/language/builder';
import { StructureQueryHelper } from 'molstar/lib/mol-plugin-state/helpers/structure-query';
import { Mat4 } from 'molstar/lib/mol-math/linear-algebra';
import { PluginContext } from 'molstar/lib/mol-plugin/context';
import { Task } from 'molstar/lib/mol-task';

export const FlexibleAlignmentBuiltIn = PluginStateTransform.BuiltIn({
    name: 'Multiple Aligned Regions',
    display: 'Flexible Alignment',
    from: PSO.Molecule.Model,
    to: PSO.Molecule.Structure,
    params: {
        pdb: PD.Value<{
            entryId: string
            instanceId: string
        }>(Object.create(null)),
        transform: PD.Value<RigidTransformType[] | undefined>(undefined)
    }
})({
    apply({ a, params }, _plugin: PluginContext) {
        return Task.create('Build Flexible Chain', async (_ctx)=>{

            const structure = Structure.ofModel(a.data);
            const asymId = params.pdb.instanceId;

            const l = StructureElement.Location.create();
            for (const unit of structure.units) {
                StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                if (SP.chain.label_asym_id(l) === asymId) {

                    const type = SP.entity.type(l);
                    if (type !== 'polymer')
                        throw new Error(`Aligned chain is of type [ ${type} ]. Must be a polymer`);

                    const builder = Structure.Builder({ label: structure.label });
                    builder.beginChainGroup();
                    for (const trans of params.transform ?? []) {
                        const residues = [];
                        for (const r of trans.regions ?? []) {
                            residues.push(toRange(r[0], r[1]));
                        }
                        const expression = residues.length > 0 ? MS.struct.generator.atomGroups({
                            'chain-test': MS.core.logic.and([
                                MS.core.rel.eq([MS.ammp('label_asym_id'), asymId])
                            ]),
                            'residue-test': MS.core.set.has([MS.set(...residues.flat()), MS.ammp('label_seq_id')])
                        }) : MS.struct.generator.atomGroups({
                            'chain-test': MS.core.logic.and([
                                MS.core.rel.eq([MS.ammp('label_asym_id'), asymId])
                            ])
                        });
                        const { selection } = StructureQueryHelper.createAndRun(structure, expression);
                        const s = StructureSelection.unionStructure(selection);
                        const ts: Structure = Structure.transform(s, trans.transform as unknown as Mat4);
                        const u = ts.units[0];
                        builder.addUnit(u.kind, u.model, u.conformation.operator, u.elements, u.traits, u.invariantId);
                    }
                    builder.endChainGroup();
                    const blockStructure = builder.getStructure();
                    return new PSO.Molecule.Structure(blockStructure, { label: structure.label });
                }
            }
            throw new Error(`Chain with asym_id [ ${asymId} ] was not found in the model used for building flexible alignment structure`);
        });
    },
    dispose({ b }) {
        b?.data.customPropertyDescriptors.dispose();
    }
});

function toRange(start: number, end?: number): number[] {
    if (!end) return [start];
    const b = start < end ? start : end;
    const e = start < end ? end : start;
    return [...Array(e - b + 1)].map((_, i) => b + i);
}