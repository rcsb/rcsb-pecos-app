import { Subscription } from 'rxjs';
import React, { useEffect, createRef } from 'react';
import {
    Viewer
} from '@rcsb/rcsb-molstar/build/src/viewer';
import {
    LoadPdbIdParams,
    LoadFromUrlParams,
    LoadStructureParams
} from '../../manager/alignment-maganger';
import { ApplicationContext, DownloadOptions, SelectionOptions } from '../../context';
import { AlignmentReference } from '../../saguaro-3d/AlignmentReference';
import {
    RcsbModuleDataProviderInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface';
import {
    alignmentCloseResidues,
    ColorConfig, entryColors, RcsbLoadParamsProvider,
    RcsbStructuralAlignmentProvider
} from '../../saguaro-3d/ExternalAlignmentProvider';
import { SequenceReference } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { RcsbFv3DAlignmentProvider } from '@rcsb/rcsb-saguaro-3d/lib/RcsbFv3D/RcsbFv3DAlignmentProvider';
import { AlignmentTrackFactory } from '../../saguaro-3d/AlignmentTrackFactory';
import { ColorLists, convertHexToRgb } from '../../utils/color';
import { exportHierarchy } from 'molstar/lib/extensions/model-export/export';
import { CloseResidueColorThemeProvider } from '../../saguaro-3d/molstar-trajectory/Coloring';


let panel3D: RcsbFv3DAlignmentProvider;
export function StructureViewComponent(props: { ctx: ApplicationContext }) {

    let viewer: Viewer;

    useEffect(()=>{
        if (props.ctx.state.events.status.getValue() === 'ready' && props.ctx.state.data.response.state?.results) {
            const structAlignResponse = props.ctx.state.data.response.state;
            const alignmentReference = new AlignmentReference();
            if (structAlignResponse.results) {
                alignmentReference.init(structAlignResponse.results).then(()=>{
                    const dataProvider: RcsbModuleDataProviderInterface = {
                        alignments: {
                            collector: new RcsbStructuralAlignmentProvider(structAlignResponse, alignmentReference),
                            context: {
                                queryId: 'structural-alignment',
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
                            additionalContent: () => <></>
                        },
                        additionalConfig: {
                            boardConfig: {
                                rowTitleWidth: 110,
                                disableMenu: true
                            },
                            trackConfigModifier: {
                                alignment: ()=>{
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
                            (panel3D as unknown as {downloadSubscription: Subscription}).downloadSubscription = props.ctx.state.events.download.subscribe(() => exportHierarchy(plugin, { format: 'cif' }));
                            // Hides / Displays molstar tooltip on panel expansion
                            plugin.layout.events.updated.subscribe(()=>{
                                const tooltip = (document.getElementsByClassName('msp-highlight-toast-wrapper').item(0) as HTMLElement);
                                if (plugin.layout.state.isExpanded)
                                    tooltip.style.visibility = 'visible';
                                else
                                    tooltip.style.visibility = 'hidden';
                            });
                            if (!plugin.representation.structure.themes.colorThemeRegistry.has(CloseResidueColorThemeProvider))
                                plugin.representation.structure.themes.colorThemeRegistry.add(CloseResidueColorThemeProvider);
                        });
                    });
                });
            }
        } else {
            setTimeout(()=>panel3D?.unmount());
            (panel3D as unknown as {downloadSubscription: Subscription})?.downloadSubscription?.unsubscribe();
        }
    });

    return <div id={'1d-3d-div'} style={{ height: 515, marginTop: 10 }}></div>;
}
