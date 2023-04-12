import React, { useEffect, useState } from 'react';

import { Status, ApplicationContext } from '../context';
import { QueryRequest } from '../utils/request';
import { useObservable } from '../utils/helper';
import { InputUIComponent } from './form/input-form';
import { ErrorMessage } from './view/error';
import {
    RcsbModuleDataProviderInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface';
import {
    alignmentCloseResidues, ColorConfig, entryColors, RcsbLoadParamsProvider
} from '../saguaro-3d/ExternalAlignmentProvider';
import { GroupReference, SequenceReference } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { ColorLists, convertHexToRgb } from '../utils/color';
import { AlignmentScoresComponent } from './view/scores';
import { AlignmentTrackFactory } from '../saguaro-3d/AlignmentTrackFactory';
import { CopyResultsComponent, DownloadAssetsComponent } from './view/actions';
import { exportHierarchy } from 'molstar/lib/extensions/model-export/export';
import { RcsbFv3DAlignmentProvider } from '@rcsb/rcsb-saguaro-3d/lib/RcsbFv3D/RcsbFv3DAlignmentProvider';
import { RcsbStructuralAlignmentProvider } from '../saguaro-3d/ExternalAlignmentProvider';
import { AlignmentReference } from '../saguaro-3d/AlignmentReference';
import { Subscription } from 'rxjs';
import { closeResidueColorThemeProvider } from '../saguaro-3d/molstar-trajectory/Coloring';

let panel3D: RcsbFv3DAlignmentProvider;
export function ApplicationContextContainer(props: {ctx: ApplicationContext}) {

    const [state, setState] = useState<Status>(props.ctx.state.events.status.getValue());
    useObservable<Status>(props.ctx.state.events.status, setState);
    useEffect(()=>{
        if (state === 'ready' && props.ctx.state.data.response.state?.results) {
            const structAlignResponse = props.ctx.state.data.response.state;
            const alignmentReference = new AlignmentReference();
            if (structAlignResponse.results) {
                alignmentReference.init(structAlignResponse.results).then(()=>{
                    const dataProvider: RcsbModuleDataProviderInterface = {
                        alignments: {
                            collector: new RcsbStructuralAlignmentProvider(structAlignResponse, alignmentReference),
                            context: {
                                queryId: 'structural-alignment',
                                group: GroupReference.MatchingUniprotAccession,
                                to: SequenceReference.PdbInstance
                            },
                            trackFactories: {
                                alignmentTrackFactory: new AlignmentTrackFactory(alignmentCloseResidues(alignmentReference.getMapAlignments()))
                            }
                        }
                    };
                    panel3D?.unmount();
                    const colorConfig = new ColorConfig({
                        closeResidues: alignmentCloseResidues(alignmentReference.getMapAlignments() ?? []),
                        colors: entryColors(alignmentReference.getMapAlignments() ?? [])
                    });
                    let index = 0;
                    panel3D = new RcsbFv3DAlignmentProvider({
                        elementId: '1d-3d-div',
                        config: {
                            dataProvider: dataProvider,
                            loadParamsProvider: new RcsbLoadParamsProvider(
                                structAlignResponse,
                                alignmentReference,
                                colorConfig
                            ),
                            additionalContent: (props) => <></>
                        },
                        additionalConfig: {
                            boardConfig: {
                                rowTitleWidth: 110,
                                disableMenu: true
                            },
                            trackConfigModifier: {
                                alignment: (ac, ta)=>{
                                    const color = convertHexToRgb(ColorLists['set-1'][index++], 0.8);
                                    return new Promise((resolve)=>resolve({
                                        titleFlagColor: color
                                    }));
                                }
                            },
                            externalUiComponents: {
                                replace: []
                            }
                        },
                        molstarProps: {
                            showStructureSourceControls: false,
                            showStrucmotifSubmitControls: false,
                            showSuperpositionControls: false
                        }
                    });
                    panel3D.render().then(()=>{
                        panel3D.pluginCall(plugin=>{
                            (panel3D as unknown as {downloadSubscription: Subscription}).downloadSubscription = props.ctx.state.events.download.subscribe((e) => exportHierarchy(plugin, { format: 'cif' }));
                            // TODO Very ugly but it does the job
                            plugin.layout.events.updated.subscribe(()=>{
                                const tooltip = (document.getElementsByClassName('msp-highlight-toast-wrapper').item(0) as HTMLElement);
                                if (plugin.layout.state.isExpanded)
                                    tooltip.style.visibility = 'visible';
                                else
                                    tooltip.style.visibility = 'hidden';
                            });
                            const residueColoring = closeResidueColorThemeProvider(colorConfig);
                            if (residueColoring && !plugin.representation.structure.themes.colorThemeRegistry.has(residueColoring))
                                plugin.representation.structure.themes.colorThemeRegistry.add(residueColoring);
                        });
                    });
                });
            }
        } else {
            setTimeout(()=>panel3D?.unmount());
            (panel3D as unknown as {downloadSubscription: Subscription})?.downloadSubscription?.unsubscribe();
        }
    });

    return (
        <>
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
                        <AlignmentScoresComponent ctx={props.ctx}/>
                        <div className='box-row inp-space inp-space-horizontal' style={{ justifyContent: 'flex-end' }}>
                            <DownloadAssetsComponent ctx={props.ctx}/>
                            <CopyResultsComponent ctx={props.ctx}/>
                        </div>
                    </>}
                </div>
            </div>
            <div id={'1d-3d-div'} style={{ height: 515, marginTop: 10 }}></div>
        </>
    );
}