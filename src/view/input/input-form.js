import React, {useState} from 'react';
import classNames from 'classnames';

import InputList from './input-list';
import InputAddItem from './input-add-item';
import MethodSelection from './input-method';

import AlignmentModeEnum from '../../model/enum/enum-alignment-mode';

export default function InputForm({ ctx, submitFn, clearFn }) {

  const styleClearBtn = classNames('btn-action', 'btn-clear')
  const styleSubmitBtn = classNames('btn-action', 'btn-submit')
  const layoutVertical = classNames('inp-space', 'inp-space-vertical')
  const layoutHorizontal = classNames('inp-space', 'inp-space-horizontal')
  
  const [items, updateItems] = useState(ctx.getTypes());

  function isDisabled() {
    if (ctx.getMode() === AlignmentModeEnum.PAIRWISE.value) {
      return ctx.structuresCount() >= 2;
    }
    return false;
  }

  function addItem(item) {
    const types = ctx.addStructure(item);
    updateItems(types);
  }

  function removeItem(index) {
    const types = ctx.deleteStructure(index);
    updateItems(types);
  }

  function updateItemType(index, type) {
    const types = ctx.resetStructure(index, type);
    updateItems(types);
  }

  function onSubmit() {
    submitFn();
  }

  function onClear() {
    clearFn();
    updateItems(ctx.getTypes());
  }

  return (
    <div className={layoutVertical}>
      <InputList 
        ctx={ctx} 
        itemsList={items}
        onRemove={removeItem}
        onChange={updateItemType}
      />
      <InputAddItem 
        disabled={isDisabled()}
        onItemSelection={addItem}
      />
      <br/>
      <MethodSelection ctx={ctx} />
      <div className={layoutHorizontal} style={{ justifyContent: 'flex-end' }}>
        <button
          className={styleSubmitBtn}
          disabled={!ctx.isSubmittable()}
          onClick={onSubmit}>
          Compare
        </button>
        <button
          className={styleClearBtn}
          onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  )
}
