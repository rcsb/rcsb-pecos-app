import React, { useState, useEffect } from 'react';
import '../collapse/index.css';
import Collapse from 'rc-collapse';

import InputForm from './input-form';
const { Panel } = Collapse;

export default function MainViewInputs({ ctx, onMount, onSubmit, onClear }) {
    const [activeKey, updateKey] = useState(['0']);

    useEffect(() => { onMount([activeKey, updateKey]); }, [onMount, activeKey]);

    return (
        <div className='box-row'>
            <Collapse
                activeKey={activeKey}
                className='inp-panel'
                onChange={updateKey}>
                <Panel header='Compare Protein Structures' key={activeKey}>
                    <InputForm ctx={ctx}
                        submitFn={onSubmit}
                        clearFn={onClear} />
                </Panel>
            </Collapse>
        </div>
    );
}
