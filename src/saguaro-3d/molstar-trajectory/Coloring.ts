import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property';
import { ElementIndex, Model } from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';
import { TagDelimiter } from '@rcsb/rcsb-saguaro-app';

export function closeResidueColoring(closeResidues: Map<string, Set<number>>, colors: Map<string, number>) {
    return CustomElementProperty.create<[number, boolean]>({
        label: 'Residue Stripes',
        name: 'basic-wrapper-residue-striping',
        getData(model: Model) {
            const map = new Map<ElementIndex, [number, boolean]>();
            for (let i = 0; i < model.atomicHierarchy.atoms._rowCount; i++) {
                const residueIndex = model.atomicHierarchy.residueAtomSegments.index[i];
                const residueId = model.atomicHierarchy.residues.label_seq_id.value(residueIndex)
                const chainIndex = model.atomicHierarchy.chainAtomSegments.index[i];
                const chainId = model.atomicHierarchy.chains.label_asym_id.value(chainIndex);
                const instanceId = `${model.entryId}${TagDelimiter.instance}${chainId}`;
                map.set(i as ElementIndex, [colors.get(instanceId) ?? 0, !closeResidues.has(instanceId) || (closeResidues.get(instanceId)?.has(residueId) ?? false)]);
            }
            return { value: map };
        },
        coloring: {
            getColor(e) { return Color.lighten(Color(e[0]), e[1] ? 0 : 1.75); },
            defaultColor: Color(0x777777)
        }
    });
}