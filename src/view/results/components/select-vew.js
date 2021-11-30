import React, { useState, useEffect } from 'react';
import Menu, { Item as MenuItem } from 'rc-menu';
import Dropdown from 'rc-dropdown';
import DropdownArrowIcon from '../../icons/dropdown';

export default function SelectView({ options, onSelect }) {

  const [isVisible, setVisiblity] = useState(false);

  const changeVisible = (visible) => {
    setVisiblity(visible)
  }

  const handleSelect = ({ key }) => {
    setVisiblity(false);
    const id = parseInt(key);
    onSelect(id);
  }

  const listMenuItems = () => {
    const menu = []
    for (const option of options) {
      menu.push(
        <MenuItem key={option.id}>
          <span>{option.name}</span>
        </MenuItem>
      )
    }
    return menu
  }

  const menu = (
    <Menu className='files-download-menu'
          onSelect={handleSelect}>
          {listMenuItems()}
    </Menu>
  )

  return (
    <Dropdown
      trigger={['click']}
      onVisibleChange={changeVisible}
      visible={isVisible}
      overlay={menu}
      animation='slide-up'
    >
      <button className='btn-action btn-submit'>
        Select View <DropdownArrowIcon />
      </button>
    </Dropdown>
  )
}
