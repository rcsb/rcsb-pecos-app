import { useState } from 'react';

import './skin/tabs.css';
import Tabs, { TabPane } from 'rc-tabs';

import { Status, ApplicationContext } from '../context';
import { QueryRequest } from '../utils/request';
import { useObservable } from '../utils/helper';
import { InputUIComponent } from './form/input-form';
import { StructureViewComponent } from './view/structure';
import { MembersInfoComponent } from './view/members';
import { SelectCoordsComponent, DownloadAssetsComponent, CopyResultsComponent } from './view/actions';
import { SequenceViewComponent } from './view/sequence';
import { AlignmentScoresComponent } from './view/scores';
import { ErrorMessage } from './view/error';

export function ApplicationContextContainer(props: {ctx: ApplicationContext}) {

    const [state, setState] = useState<Status>(props.ctx.state.events.status.getValue());
    useObservable<Status>(props.ctx.state.events.status, setState);

    return (
        <div className='app-body'>
            <div className='box-column'>
                <InputUIComponent
                    ctx={props.ctx}
                    isCollapsed={state === 'ready'}
                    onSubmit={(r: QueryRequest) => props.ctx.align(r)}
                />
                {state === 'loading' && <div className="spinner"></div>}
                {state === 'error' && <ErrorMessage ctx={props.ctx}/>}
                {state === 'ready' && <>
                    <MembersInfoComponent ctx={props.ctx}/>
                    <Tabs className='tabs-panel' defaultActiveKey='1'>
                        <TabPane tab="SEQUENCE ALIGNMENT" key='1' id='1'>
                            <SequenceViewComponent ctx={props.ctx}/>
                        </TabPane>
                        <TabPane tab="SUMMARY" key='2' id='2'>
                            <AlignmentScoresComponent ctx={props.ctx}/>
                        </TabPane>
                    </Tabs>
                    <div className='box-row inp-space inp-space-horizontal' style={{ justifyContent: 'flex-end' }}>
                        <SelectCoordsComponent ctx={props.ctx}/>
                        <DownloadAssetsComponent ctx={props.ctx}/>
                        <CopyResultsComponent ctx={props.ctx}/>
                    </div>
                    <StructureViewComponent ctx={props.ctx}/>
                </>}
            </div>
        </div>
    );
}