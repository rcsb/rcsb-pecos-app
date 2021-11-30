export const AlignmentModeEnum = Object.freeze({
    PAIRWISE: {
        id: 1,
        value: 'pairwise',
        name: 'Pairwise Structure Alignment'
    },
    MULTIPLE: {
        id: 2,
        value: 'multiple',
        name: 'Multiple Structure Alignment'
    }
});

export const DEFAULT_ALIGNMENT_MODE = AlignmentModeEnum.PAIRWISE.value;

export default AlignmentModeEnum;