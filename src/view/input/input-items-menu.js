import React from 'react';
import InputOptionsEnum from '../../model/enum/enum-input-options';

function MenuItem({ item, onSelect }) {
    return (
        <div className='dropdown-item' onClick={() => onSelect(item)}>
            {item.name}
        </div>
    );
}

export default function InputItemsMenu({ onSelect }) {
    return (
        <div className='dropdown-content'>
            <MenuItem item={InputOptionsEnum.PDB_ENTRY}  onSelect={onSelect}/>
            <MenuItem item={InputOptionsEnum.FILE_UPLOAD} onSelect={onSelect}/>
            <MenuItem item={InputOptionsEnum.WEB_LINK}  onSelect={onSelect}/>
        </div>
    )
}