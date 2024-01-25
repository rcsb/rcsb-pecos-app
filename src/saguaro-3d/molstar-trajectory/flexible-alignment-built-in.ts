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
import { RootStructureDefinition } from 'molstar/lib/mol-plugin-state/helpers/root-structure';

export const FlexibleAlignmentBuiltIn = PluginStateTransform.BuiltIn({
    name: 'Multiple Aligned Regions',
    display: 'Flexible Alignment',
    from: PSO.Molecule.Model,
    to: PSO.Molecule.Structure,
    params: {
        pdb: PD.Value<{entryId: string;instanceId: string;}>(Object.create(null)),
        transform: PD.Value<RigidTransformType[]|undefined>(undefined)
    }
})({
    apply({ a, params }, plugin: PluginContext) {
        return Task.create('Build Flexible Chain', async (ctx)=>{
            const base = await RootStructureDefinition.create(plugin, ctx, a.data);
            const structure = base.data;
            const instanceId = params.pdb.instanceId;
            const l = StructureElement.Location.create(structure);
            let alignedAsymId;
            let alignedOperatorName;
            let alignedType;

            for (const unit of structure.units) {
                StructureElement.Location.set(l, structure, unit, unit.elements[0]);
                if (SP.chain.label_asym_id(l) === instanceId) {
                    alignedAsymId = SP.chain.label_asym_id(l);
                    alignedOperatorName = SP.unit.operator_name(l);
                    alignedType = SP.entity.type(l);
                    const alignedOperators: string[] = SP.unit.pdbx_struct_oper_list_ids(l);
                    if (alignedOperators.length === 0) alignedOperators.push('0');
                    if (alignedType !== 'polymer')
                        throw new Error(`Aligned chain type ${alignedType}is not polymer`);

                    const builder = Structure.Builder({ label: structure.label });
                    builder.beginChainGroup();
                    for (const trans of params.transform ?? []) {
                        const residues = [];
                        for (const r of trans.regions ?? []) {
                            residues.push(toRange(r[0], r[1]));
                        }
                        const expression = residues.length > 0 ? MS.struct.generator.atomGroups({
                            'chain-test': MS.core.logic.and([
                                MS.core.rel.eq([MS.ammp('label_asym_id'), alignedAsymId]),
                                MS.core.rel.eq([MS.acp('operatorName'), alignedOperatorName])
                            ]),
                            'residue-test': MS.core.set.has([MS.set(...residues.flat()), MS.ammp('label_seq_id')])
                        }) : MS.struct.generator.atomGroups({
                            'chain-test': MS.core.logic.and([
                                MS.core.rel.eq([MS.ammp('label_asym_id'), alignedAsymId]),
                                MS.core.rel.eq([MS.acp('operatorName'), alignedOperatorName])
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
            throw new Error(`No chain ${instanceId} was found`);
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