import {
    Bond,
    StructureElement as SE,
    StructureProperties as SP
} from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ParamDefinition } from 'molstar/lib/mol-util/param-definition';
import { ColorTheme, LocationColor } from 'molstar/lib/mol-theme/color';
import { Location } from 'molstar/lib/mol-model/location';
import { getAlignmentColorHex, DefaultColor } from '../../utils/color';

export const STRUCTURAL_ALIGNMENT_COLOR = 'staructual-alignment-color' as ColorTheme.BuiltIn;
function structuralAlignmentColorTheme(ctx: ThemeDataContext, props: ParamDefinition.Values<{}>): ColorTheme<{}> {

    const L = SE.Location.create();
    const locationColor = (location: SE.Location) => {
        const index = ctx.structure?.inheritedPropertyData.rcsb_alignmentModelIndex as number;
        const color = getAlignmentColorHex(index);
        if (SP.entity.type(location) === 'polymer') {
            return Color(color);
        } else {
            // mute the main color for non-polymeric molecules
            return Color.desaturate(Color.lighten(Color(color), 1.7), 1.2);
        }
    };

    let color: LocationColor;
    if (ctx.structure) {
        color = (location: Location) => {
            if (SE.Location.is(location)) {
                return locationColor(location);
            } else if (Bond.isLocation(location)) {
                L.structure = location.aStructure;
                L.unit = location.aUnit;
                L.element = location.aUnit.elements[location.aIndex];
                return locationColor(L);
            }
            return DefaultColor;
        };
    } else {
        color = () => DefaultColor;
    }

    return {
        factory: structuralAlignmentColorTheme,
        granularity: 'group',
        color,
        props
    };
}

export const StructuralAlignmentColorThemeProvider = {
    name: STRUCTURAL_ALIGNMENT_COLOR,
    label: 'Structural Alignment',
    category: ColorTheme.Category.Misc,
    factory: structuralAlignmentColorTheme,
    getParams: () => ({}),
    defaultValues: ParamDefinition.getDefaultValues({}),
    isApplicable: () => true,
};