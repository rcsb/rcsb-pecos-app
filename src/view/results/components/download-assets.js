import React, { Component } from 'react';
import Dropdown from 'rc-dropdown';
import Menu, { Item as MenuItem, Divider } from 'rc-menu';

import DownloadIcon from '../../icons/download';
import DropdownArrowIcon from '../../icons/dropdown';
import DownloadOptionsEnum from '../../../model/enum/enum-options-download';
import DownloadEventObservable from '../../../observable/download-observable';

import { exportMatricesAsJSON } from '../../../adapter/api-to-metadata';
import { exportAlignmentAsFASTA } from '../../../adapter/api-to-sequence';

function optionsToChildren(options) {
  const children = []
  for (const option of options) {
    if (option.id === options.length) {
      children.push(<Divider key={option.length + 1} />)
    }
    children.push(
      <MenuItem key={option.id}>
        <span>{option.name}</span>
      </MenuItem>
    )
  }
  return children;
}

const triggerDownload = (e, data) => {
  if (!e) return;
  if (e === DownloadOptionsEnum.ALL_ASSETS.id || e === DownloadOptionsEnum.SEQUENCE_ALIGNMENT.id ) {
    exportAlignmentAsFASTA(data);
  } 
  if (e === DownloadOptionsEnum.ALL_ASSETS.id || e === DownloadOptionsEnum.TRANSFORMATIONS.id ) {
    exportMatricesAsJSON(data);
  }
  if (e === DownloadOptionsEnum.ALL_ASSETS.id || e === DownloadOptionsEnum.SUPERPOSED_STRUCTURES.id) {
    DownloadEventObservable.newEvent(e);
  } 
}

export default class DownloadAssets extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
      results: props.results
    }
  }

  onVisibleChange = (visible) => {
    this.setState({ visible })
  }

  selectOption = ({ key }) => {
    this.setState({ visible: false })
    triggerDownload(parseInt(key), this.state.results);
  }

  render() {
    const menu = (
      <Menu className='files-download-menu' onClick={this.selectOption}>
        {optionsToChildren(Object.values(DownloadOptionsEnum))}
      </Menu>
    )

    return (
      <Dropdown
        trigger={['click']}
        onVisibleChange={this.onVisibleChange}
        overlay={menu}
        animation='slide-up' >
        <button className='btn-action btn-submit'>
          <DownloadIcon /> Download Files <DropdownArrowIcon />
        </button>
      </Dropdown>
    )
  }
}
