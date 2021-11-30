import React from "react";

import PlusSignIcon from '../icons/plus-sign';
import MutateItemType from './input-mutate-item-type';
import InputOptionsEnum from '../../model/enum/enum-input-options';

export default function InputAddItem({ onItemSelection, disabled }) {

  return (
    <div className='add-new-item-container'>
      {
        disabled &&
        <span title="Remove any of existing items to add a new one">
          <PlusSignIcon disabled={true}/>
        </span>
      }
      {
        !disabled && 
        <div className='new-item-area'>
          <span title="Click to add PDB ID"
            onClick={() => onItemSelection(InputOptionsEnum.PDB_ENTRY)}>
            <PlusSignIcon />
          </span>
          < MutateItemType 
            showTitle="Click to select a new item"
            onItemSelection={onItemSelection}
          />
        </div>
      }
    </div>
  )
}
