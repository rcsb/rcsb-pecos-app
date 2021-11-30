import React, { useState, useEffect } from 'react';

import TransformationOptions from './view-transforms';

import SelectView from './components/select-vew';
import DownloadAssets from './components/download-assets';
import CopyResultsLink from './components/copy-results-link';
import ViewOptionsEnum from '../../model/enum/enum-view-options';
import AlignmentTypeEnum from '../../model/enum/enum-alignment-type';

import ViewStatistics from './view-statistics';
import { resultsToStatistics } from '../../adapter/api-to-metadata';

import Wrapper1Dto3D from './wrapper-1d-3d';

function getOptionById(id) {
  switch (id) {
    case ViewOptionsEnum.RESIDUES.id:
      return ViewOptionsEnum.RESIDUES;
    case ViewOptionsEnum.POLYMER_CHAINS.id:
      return ViewOptionsEnum.POLYMER_CHAINS;
    case ViewOptionsEnum.STRUCTURES.id:
      return ViewOptionsEnum.STRUCTURES;
  }
}

function generateViewOptions(type) {
  if (type.id === AlignmentTypeEnum.FLEXIBLE.id) {
    return [ViewOptionsEnum.RESIDUES];
  } else {
    return [
      ViewOptionsEnum.POLYMER_CHAINS,
      ViewOptionsEnum.STRUCTURES,
      ViewOptionsEnum.RESIDUES
    ];
  }
}

export default function PairwiseAlignmentResults({ transformOptions, response }) {

  const type = transformOptions[0];
  const viewOptions = generateViewOptions(type);
  const [config, updateConfig] = useState({type: type, view: viewOptions[0]});

  const onTypeChange = (typeIndex) => {
    const nextType = transformOptions.filter(o => o.index === typeIndex)[0];
    if (nextType.index !== config.type.index) {
      const updated = { ...config };
      updated.type = nextType;
      updated.view = generateViewOptions(nextType)[0];
      updateConfig(updated);
    }
  }

  const onViewChange = (id) => {
    const nextView = getOptionById(id);
    if (nextView.id !== config.view.id) {
      const updated = { ...config };
      updated.view = nextView;
      updateConfig(updated);
    };
  }

  return (
    <>
      <TransformationOptions
        options={transformOptions}
        onChange={onTypeChange}
      />
      <ViewStatistics
        data={resultsToStatistics(response.getResults(), config.type)}
      />
      <div className='inp-space inp-space-horizontal' style={{ justifyContent: 'flex-end'}}>
        <SelectView
          options={generateViewOptions(config.type)}
          onSelect={onViewChange}
        />
        <DownloadAssets
          results={response.getResults()}
        />
        <CopyResultsLink
          response={response}
        />
      </div>
      <Wrapper1Dto3D 
        results={response.getResults()}
        view={config.view}
        type={config.type}
      />
    </>
  )
}