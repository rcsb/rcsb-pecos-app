export const MethodOptionsEnum = Object.freeze({
    FATCAT_RIGID: {
        id: 1,
        value: 'fatcat-rigid',
        name: 'jFATCAT (rigid)'
    },
    FATCAT_FLEXIBLE: {
        id: 2,
        value: 'fatcat-flexible',
        name: 'jFATCAT (flexible)'
    },
    CE: {
        id: 3,
        value: 'ce',
        name: 'jCE'
    },
    CE_CP: {
        id: 4,
        value: 'ce-cp',
        name: 'jCE-CP'
    },
    TM_ALIGN: {
        id: 5,
        value: 'tm-align',
        name: 'TM-align'
    },
    SMITH_WATERMAN_3D: {
        id: 6,
        value: 'smith-waterman-3d',
        name: 'Smith-Waterman 3D'
    }
});

export const ALIGNMENT_METHOD_DEFAULT = MethodOptionsEnum.FATCAT_RIGID;

export function hasParameters(value) {
    return value === MethodOptionsEnum.FATCAT_RIGID.value ||
    value === MethodOptionsEnum.FATCAT_FLEXIBLE.value ||
    value === MethodOptionsEnum.CE.value ||
    value === MethodOptionsEnum.CE_CP.value ||
    value === MethodOptionsEnum.SMITH_WATERMAN_3D.value;
}
