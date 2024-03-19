import { CustomPropertyDescriptor } from 'molstar/lib/mol-model/custom-property';
import { StructureElement, StructureProperties } from 'molstar/lib/mol-model/structure';
import { CustomPropSymbol } from 'molstar/lib/mol-script/language/symbol';
import { Type } from 'molstar/lib/mol-script/language/type';
import { QuerySymbolRuntime, DefaultQueryRuntimeTable } from 'molstar/lib/mol-script/runtime/query/base';
import { ResidueCollection } from '../alignment-reference';

export function isCloseResidue(l: StructureElement.Location) {
    const isIdentityMap = l.structure.inheritedPropertyData.rcsb_alignmentIsIdentityMap as Map<number, boolean>;
    const closeResidues = l.structure.inheritedPropertyData.rcsb_alignmentCloseResidues as ResidueCollection | undefined;
    if (!closeResidues) return false;

    const isIdentityOp = isIdentityMap?.get(l.unit.id) ?? false;
    const asymId = StructureProperties.chain.label_asym_id(l);
    const seqId = StructureProperties.residue.label_seq_id(l);
    return closeResidues.asymId === asymId && isIdentityOp && closeResidues?.labelSeqIds.includes(seqId);
}

export const AlignemntDataDescriptor = CustomPropertyDescriptor({
    name: 'alignment.close-residue',
    symbols: {
        closeResidue: QuerySymbolRuntime.Dynamic(CustomPropSymbol('rcsb', 'alignment.close-residue', Type.Bool),
            ctx => isCloseResidue(ctx.element)
        ),
        isIdentityUnit: QuerySymbolRuntime.Dynamic(CustomPropSymbol('rcsb', 'alignment.is-identity-unit', Type.Bool),
            ctx => {
                const { structure } = ctx.element;
                const isIdentityMap = structure.inheritedPropertyData.rcsb_alignmentIsIdentityMap as Map<number, boolean>;
                return isIdentityMap?.get(ctx.element.unit.id) ?? false;
            }
        )
    }
});

DefaultQueryRuntimeTable.addCustomProp(AlignemntDataDescriptor);