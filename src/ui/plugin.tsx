import React, { useState } from 'react';

import { Status, ApplicationContext } from '../context';
import { QueryRequest } from '../utils/request';
import { useObservable } from '../utils/helper';
import { StructureAlignmentInput } from './form/input-form';
import { ErrorMessage } from './view/error';
import { AlignmentScoresComponent } from './view/scores';
import { CopyResultsComponent, DownloadAssetsComponent } from './view/actions';
import { StructureViewComponent } from './view/structure';


export function ApplicationContextContainer(props: {ctx: ApplicationContext}) {

    const [state, setState] = useState<Status>(props.ctx.state.events.status.getValue());
    useObservable<Status>(props.ctx.state.events.status, setState);

    return (
        <>
            <div className='app-body'>
                <div className='box-column'>
                    <StructureAlignmentInput
                        ctx={props.ctx}
                        isCollapsed={state === 'ready'}
                        onSubmit={(r: QueryRequest) => props.ctx.align(r)}
                    />
                    {state === 'loading' && <div className="spinner"></div>}
                    {state === 'error' && <ErrorMessage ctx={props.ctx}/>}
                    {state === 'ready' && <>
                        <AlignmentScoresComponent ctx={props.ctx}/>
                        <div className='box-row' style={{ justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 'larger' }}>Sequence Alignment in 3D</span>
                            <div className='inp-space inp-space-horizontal'>
                                <DownloadAssetsComponent ctx={props.ctx}/>
                                <CopyResultsComponent ctx={props.ctx}/>
                            </div>
                        </div>
                    </>}
                </div>
            </div>
            <StructureViewComponent ctx={props.ctx}/>
        </>
    );
}