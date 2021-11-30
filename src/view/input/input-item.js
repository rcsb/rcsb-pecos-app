import React from 'react';
import classNames from 'classnames';

import SelectPDB from './options/select-pdb';
import UploadFile from './options/upload-file';
import PasteLink from './options/paste-link';
import DeleteIcon from '../icons/delete';
import InputOptionsEnum from '../../model/enum/enum-input-options';

import MutateItemType from './input-mutate-item-type';

export default function InputItem({ id, ctx, index, onRemove, onChange}) {

    function hadleItemSelection(itemId) {
        onChange(index, itemId)
    }

    return (
        <div className={classNames('inp-space', 'inp-space-horizontal')}>
            <span>
                <span className='icon-container' onClick={() => onRemove(index)}>
                    <DeleteIcon />
                </span> 
                < MutateItemType 
                    showTitle="Click to change an item type"
                    onItemSelection={hadleItemSelection}
                />
            </span> 
            { id === InputOptionsEnum.PDB_ENTRY.id  && <SelectPDB ctx={ctx}  index={index}/>  }
            { id === InputOptionsEnum.FILE_UPLOAD.id && <UploadFile ctx={ctx} index={index}/> }
            { id === InputOptionsEnum.WEB_LINK.id  && <PasteLink ctx={ctx}  index={index}/>   }
        </div>
    )
}
