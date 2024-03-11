import {
    Bond,
    StructureElement as SE
} from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ParamDefinition } from 'molstar/lib/mol-util/param-definition';
import { ColorTheme, LocationColor } from 'molstar/lib/mol-theme/color';
import { Location } from 'molstar/lib/mol-model/location';
import { getAlignmentColorHex, DefaultColor } from '../../utils/color';
import { isCloseResidue } from './alignment-data-descriptor';

export const STRUCTURAL_ALIGNMENT_CLOSE_RESIDUE_COLOR = 'staructual-alignment-close-residue-color' as ColorTheme.BuiltIn;
export const CloseResidueAlignmentColorThemeProvider = {
    name: STRUCTURAL_ALIGNMENT_CLOSE_RESIDUE_COLOR,
    label: 'Structural Alignment Residues',
    category: ColorTheme.Category.Misc,
    factory: closeResidueAlignmentColorTheme,
    getParams: () => ({}),
    defaultValues: ParamDefinition.getDefaultValues({}),
    isApplicable: () => true,
};
function closeResidueAlignmentColorTheme(ctx: ThemeDataContext, props: ParamDefinition.Values<{}>): ColorTheme<{}> {

    const L = SE.Location.create();
    const locationColor = (location: SE.Location) => {
        const index = ctx.structure?.inheritedPropertyData.rcsb_alignmentModelIndex as number;
        const color = getAlignmentColorHex(index);
        if (isCloseResidue(location)) {
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
        factory: closeResidueAlignmentColorTheme,
        // needs to be evaluated for each instance
        granularity: 'groupInstance',
        color,
        props
    };
}

export const STRUCTURAL_ALIGNMENT_HOMOGENOUS_COLOR = 'staructual-alignment-homogenous-color' as ColorTheme.BuiltIn;
export const HomogenousAlignmentColorThemeProvider = {
    name: STRUCTURAL_ALIGNMENT_HOMOGENOUS_COLOR,
    label: 'Structural Alignment',
    category: ColorTheme.Category.Misc,
    factory: homogenousAlignmentColorTheme,
    getParams: () => ({}),
    defaultValues: ParamDefinition.getDefaultValues({}),
    isApplicable: () => true,
};
function homogenousAlignmentColorTheme(ctx: ThemeDataContext, props: ParamDefinition.Values<{}>): ColorTheme<{}> {

    let color: LocationColor;
    if (ctx.structure) {
        color = () => {
            const index = ctx.structure?.inheritedPropertyData.rcsb_alignmentModelIndex as number;
            const color = getAlignmentColorHex(index);
            return Color(color);
        };
    } else {
        color = () => DefaultColor;
    }

    return {
        factory: homogenousAlignmentColorTheme,
        granularity: 'groupInstance',
        color,
        props
    };
}