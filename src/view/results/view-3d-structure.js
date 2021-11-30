import React from 'react';
import '@rcsb/rcsb-molstar/build/dist/viewer/rcsb-molstar.css';
import { Viewer } from '@rcsb/rcsb-molstar/build/dist/viewer/rcsb-molstar';

import { deepEqual } from '../../utils/common';
import EntryPreset from '../../model/molstar/preset-entry';

import DownloadOptionsEnum from '../../model/enum/enum-options-download';
import DownloadEventObservable from '../../observable/download-observable';

export default class View3DStructure extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      presets: props.presets
    };
    this.viewerRef = React.createRef();
    this.downloadEvents = DownloadEventObservable.onEvent().subscribe((event) =>
      this.triggerDownload(event)
    );
  }

  componentDidMount() {
    this.viewer = new Viewer(this.viewerRef.current, {
      showImportControls: false,
      showExportControls: true,
      showSessionControls: false,
      showStructureSourceControls: false,
      showSuperpositionControls: false,
      layoutShowLog: false,
      layoutShowControls: false,
    });
    // we need to have a delay before handleResize() is called
    // in order to fit Molstart canvas into re layout
    setTimeout(() => this.viewer.handleResize(), 500);
    this.loadPresets(this.props.presets);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!deepEqual(this.props.presets, prevProps.presets)) {
      this.viewer.clear();
      this.updateId = setTimeout(() => this.loadPresets(this.props.presets), 500);
    }
  }

  componentWillUnmount() {
    this.downloadEvents.unsubscribe();
  }

  loadPresets = async (presets) => {
    if (presets) {
      for (const preset of presets) {
        if (preset instanceof EntryPreset)
          await this.viewer.loadPdbId(
            preset.getPdbId(),
            preset.getProps().toObject(),
            preset.getMatrix()
          );
        else
          await this.viewer.loadStructureFromUrl(
            preset.getURL(),
            preset.getFormat(),
            preset.getIsBinary(),
            preset.getProps().toObject(),
            preset.getMatrix()
          );
      }
      this.viewer.resetCamera(0);
    }
  }

  triggerDownload(event) {
    if ( event && (event === DownloadOptionsEnum.ALL_ASSETS.id ||
                    event === DownloadOptionsEnum.SUPERPOSED_STRUCTURES.id )) {
      this.viewer.exportLoadedStructures();
      DownloadEventObservable.newEvent(undefined);
    }
  }

  render() {
    return <div className='viewer-canvas' ref={this.viewerRef} />
  }
}