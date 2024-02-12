import { Color } from 'molstar/lib/mol-util/color';

export const DefaultColor = Color(0x777777);

export const ColorLists = {
    'set-1': [0xe19039, 0x4b7fcc, 0x229954, 0xfb9a99, 0xe31a1c, 0xff7f00, 0x6a3d9a, 0xb15928, 0x01665e, 0xbc80bd]
};

/**
 * Convert any Hex color code to its RGB value, prepared for inclusion in CSS styles
 *
 * @param hex Hex color value
 * @param alpha opacity value (alpha)
 * @returns RGB value
 */
export function convertHexToRgb(hex: number, alpha: number) {
    return 'rgb(' + ((hex >> 16) & 255) + ', ' + ((hex >> 8) & 255) + ', ' + (hex & 255) + ',' + alpha + ')';
}

export class AlignmentColoringConfig {

    private readonly colorConfig: {closeResidues: Map<string, Set<number>>; colors: Map<string, number>;};
    readonly idMap: Map<string, string> = new Map<string, string>();
    private readonly uniqueChainMap: Map<string, {asymId: string; operatorName: string;}> = new Map<string, {asymId: string; operatorName: string;}>();

    constructor(colorConfig: {closeResidues: Map<string, Set<number>>; colors: Map<string, number>;}) {
        this.colorConfig = colorConfig;
    }

    public getCloseResidues(modelId: string): Set<number> {
        return this.colorConfig.closeResidues.get(this.idMap.get(modelId) ?? 'none') ?? new Set<number>();
    }

    public getModelColor(modelId: string): number {
        return this.colorConfig.colors.get(this.idMap.get(modelId) ?? 'none') ?? 0x777777;
    }

    public setAlignmentIdToModel(modelId: string, alignmentId: string): void {
        this.idMap.set(modelId, alignmentId);
    }

    public setUniqueChain(modelId: string, asymId: string, operatorName: string): void {
        this.uniqueChainMap.set(modelId, { asymId, operatorName });
    }

    public getUniqueChain(modelId: string): {asymId: string; operatorName: string;} | undefined {
        return this.uniqueChainMap.get(modelId);
    }
}

