import React from 'react';
import clonedeep from 'lodash.clonedeep';
import { deepEqual } from '../../utils/common';

import ViewMembersInfo from './view-information';
import PairwiseAlignmentResults from './results-pairwise';

import AlignmentModeEnum from '../../model/enum/enum-alignment-mode';
import AlignmentTypeEnum from '../../model/enum/enum-alignment-type';

export default React.memo(MainViewResults, deepEqual);

const generateTransformationOptions = (alignment) => {
    const options = []
    const blocksCount = alignment.blocksNum();
    const isFlexible = blocksCount > 1;
    for (let i = 0; i < blocksCount; i++) {
        const type = clonedeep(AlignmentTypeEnum.RIGID);
        type.index = i;
        type.blockIndex = i;
        type.name = (isFlexible) ? `BLOCK ${i + 1}` : type.name;
        options.push(type);
    }
    if (isFlexible) {
        const type = clonedeep(AlignmentTypeEnum.FLEXIBLE);
        type.index = options.length;
        options.unshift(type);
    }
    return options;
}

function MainViewResults({ response }) {

    const alignment = response.getResults()[0];
    const transformOptions = generateTransformationOptions(alignment);

    return (
        <>
            <ViewMembersInfo 
                results={response.getResults()}
            />
            {response.getMeta().getAlignmentMode() === AlignmentModeEnum.PAIRWISE.value &&
                <PairwiseAlignmentResults
                    response={response}
                    transformOptions={transformOptions}
                />
            }
        </>
    )
}