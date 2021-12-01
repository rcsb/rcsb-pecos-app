import React from 'react';

import Selector from '../../../select/select';
import StructureFileFormatEnum from '../../../../model/enum/enum-file-format';

export default function FormatSelection({ value, onValueChange }) {
    const options = [
        [StructureFileFormatEnum.MMCIF.value, StructureFileFormatEnum.MMCIF.name],
        [StructureFileFormatEnum.PDB.value, StructureFileFormatEnum.PDB.name]
    ];

    return (
        <Selector
            value={value}
            options={options}
            disabled={false}
            cb={onValueChange}
            style={'inp-format'}
        />
    );
}
