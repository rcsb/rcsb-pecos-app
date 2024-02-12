import { CustomPropertyDescriptor } from 'molstar/lib/mol-model/custom-property';
import { StructureProperties } from 'molstar/lib/mol-model/structure';
import { CustomPropSymbol } from 'molstar/lib/mol-script/language/symbol';
import { Type } from 'molstar/lib/mol-script/language/type';
import { QuerySymbolRuntime, DefaultQueryRuntimeTable } from 'molstar/lib/mol-script/runtime/query/base';
import { CloseResidues } from '../alignment-reference';

export const AlignemntDataDescriptor = CustomPropertyDescriptor({
    name: 'alignment.close-residue',
    symbols: {
        closeResidue: QuerySymbolRuntime.Dynamic(CustomPropSymbol('rcsb', 'alignment.close-residue', Type.Bool),
            ctx => {
                const { structure } = ctx.element;

                const isIdentityMap = structure.inheritedPropertyData.rcsb_alignmentIsIdentityMap as Map<number, boolean>;
                const closeResidues = structure.inheritedPropertyData.rcsb_alignmentCloseResidues as CloseResidues | undefined;
                if (!closeResidues) return false;

                const isIdentityOp = isIdentityMap?.get(ctx.element.unit.id) ?? false;
                const asymId = StructureProperties.chain.label_asym_id(ctx.element);
                const seqId = StructureProperties.residue.label_seq_id(ctx.element);
                return closeResidues.asymId === asymId && isIdentityOp && closeResidues?.labelSeqIds.includes(seqId);
            }
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