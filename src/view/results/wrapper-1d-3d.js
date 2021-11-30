import React, { useState, useEffect } from 'react';

import View1DSequence from './view-1d-sequense';
import { resultsToSequence } from '../../adapter/api-to-sequence';

import View3DStructure from './view-3d-structure';
import { resultsToMolstarPresets } from '../../adapter/api-to-molstar';

export default function Wrapper1Dto3D({ results, type, view }) {
    return (
        <div className='box-row'>
            <div className='box-column' style={{ maxWidth: '650px' }}>
                <View1DSequence
                    index={type.index}
                    data={resultsToSequence(results[0], type)}
                />
            </div>
            <div className='box-column'>
                <View3DStructure
                    presets={resultsToMolstarPresets(results, view, type)}
                />
            </div>

        </div>
    )
}