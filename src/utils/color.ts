
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