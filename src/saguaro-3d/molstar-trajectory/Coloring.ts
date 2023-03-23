import { CustomElementProperty } from 'molstar/lib/mol-model-props/common/custom-element-property';
import { ElementIndex, Model } from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';

export function closeResidueColoring(alignmentId: string, closeResidues?: Set<number>, color?: number) {
    return CustomElementProperty.create<[number, boolean]>({
        label: 'Close Residue Color',
        name: `close-residue-color-${alignmentId}`,
        getData(model: Model) {
            const map = new Map<ElementIndex, [number, boolean]>();
            for (let i = 0; i < model.atomicHierarchy.atoms._rowCount; i++) {
                const residueIndex = model.atomicHierarchy.residueAtomSegments.index[i];
                const residueId = model.atomicHierarchy.residues.label_seq_id.value(residueIndex)
                if (closeResidues && color)
                    map.set(i as ElementIndex, [color, closeResidues.has(residueId) ?? false]);
            }
            return { value: map };
        },
        coloring: {
            getColor(e) { return e[1] ? Color(e[0]) : Color.desaturate(Color.lighten(Color(e[0]), 1.75), 1); },
            defaultColor: Color(0x777777)
        }
    });
}