import {
    Bond,
    StructureElement,
    StructureProperties as SP,
    StructureProperties
} from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ParamDefinition } from 'molstar/lib/mol-util/param-definition';
import { ColorTheme } from 'molstar/lib/mol-theme/color';
import { Location } from 'molstar/lib/mol-model/location';

export const EQUIVALENT_RESIDUES_COLOR = 'close-residue-color' as ColorTheme.BuiltIn;
function closeResidueColorTheme(ctx: ThemeDataContext, props: ParamDefinition.Values<{}>): ColorTheme<{}> {

    const L = StructureElement.Location.create();
    const locationColor = (location: StructureElement.Location) =>{
        if (!ctx.structure)
            return Color(0x777777);

        const colorConfig = ctx.structure?.inheritedPropertyData.colorConfig;
        const modelId = ctx.structure.model.id;
        const closeResidues = colorConfig.getCloseResidues(modelId);
        const color = colorConfig.getModelColor(modelId);
        const uniqueChain = colorConfig.getUniqueChain(modelId);

        const asymId = StructureProperties.chain.label_asym_id(location);
        const seqId = StructureProperties.residue.label_seq_id(location);
        const operatorName = SP.unit.operator_name(location);

        if (uniqueChain?.asymId === asymId && uniqueChain.operatorName === operatorName && closeResidues.has(seqId))
            return Color(color);
        return Color.desaturate(Color.lighten(Color(color), 1.7), 1.2);

    };
    const color = (location: Location) => {
        if (StructureElement.Location.is(location)) {
            return locationColor(location);
        } else if (Bond.isLocation(location)) {
            L.structure = location.aStructure;
            L.unit = location.aUnit;
            L.element = location.aUnit.elements[location.aIndex];
            return locationColor(L);
        }
        return Color(0x777777);
    };
    return {
        factory: closeResidueColorTheme,
        granularity: 'group',
        color,
        props
    };
}

export const EquivalentResiduesColorThemeProvider = {
    name: EQUIVALENT_RESIDUES_COLOR,
    label: 'Equivalent Residues',
    category: ColorTheme.Category.Misc,
    factory: closeResidueColorTheme,
    getParams: () => ({}),
    defaultValues: ParamDefinition.getDefaultValues({}),
    isApplicable: () => true,
};