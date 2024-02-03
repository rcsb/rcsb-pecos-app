import {
    Bond,
    StructureElement,
    StructureProperties as SP,
    StructureProperties
} from 'molstar/lib/mol-model/structure';
import { Color } from 'molstar/lib/mol-util/color';
import { ThemeDataContext } from 'molstar/lib/mol-theme/theme';
import { ParamDefinition } from 'molstar/lib/mol-util/param-definition';
import { ColorTheme, LocationColor } from 'molstar/lib/mol-theme/color';
import { Location } from 'molstar/lib/mol-model/location';
import { AlignmentColoringConfig } from '../external-alignment-provider';

const DefaultColor = Color(0x777777);

export const EQUIVALENT_RESIDUES_COLOR = 'close-residue-color' as ColorTheme.BuiltIn;
function structureAlignmentColorTheme(ctx: ThemeDataContext, props: ParamDefinition.Values<{}>): ColorTheme<{}> {

    const L = StructureElement.Location.create();
    const locationColor = (location: StructureElement.Location) => {

        const colorConfig = ctx.structure?.inheritedPropertyData.colorConfig as AlignmentColoringConfig;
        // const modelId = ctx.structure.model.id;
        // const closeResidues = colorConfig.getCloseResidues(modelId);
        // const color = colorConfig.getModelColor(modelId);
        // const uniqueChain = colorConfig.getUniqueChain(modelId);
        // const seqId = StructureProperties.residue.label_seq_id(location);
        // const operatorName = SP.unit.operator_name(location);

        // if (uniqueChain?.asymId === asymId && uniqueChain.operatorName === operatorName && closeResidues.has(seqId))
        //     return Color(color);
        // return Color.desaturate(Color.lighten(Color(color), 1.7), 1.2);

        const asymId = StructureProperties.chain.label_asym_id(location);
        return Color(0);

    };

    let color: LocationColor;
    if (ctx.structure) {
        color = (location: Location) => {
            if (StructureElement.Location.is(location)) {
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
        factory: structureAlignmentColorTheme,
        granularity: 'group',
        color,
        props
    };
}

export const EquivalentResiduesColorThemeProvider = {
    name: EQUIVALENT_RESIDUES_COLOR,
    label: 'Structurally Equivalent Residues',
    category: ColorTheme.Category.Misc,
    factory: structureAlignmentColorTheme,
    getParams: () => ({}),
    defaultValues: ParamDefinition.getDefaultValues({}),
    isApplicable: () => true,
};