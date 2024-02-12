import { Subscription } from 'rxjs';
import { useEffect } from 'react';

import { ApplicationContext } from '../../context';
import { AlignmentReference, CloseResidues } from '../../saguaro-3d/alignment-reference';
import {
    RcsbModuleDataProviderInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface';
import {
    RcsbLoadParamsProvider,
    RcsbStructuralAlignmentCollector
} from '../../saguaro-3d/alignment-collector';
import { SequenceReference } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { RcsbFv3DAlignmentProvider } from '@rcsb/rcsb-saguaro-3d/lib/RcsbFv3D/RcsbFv3DAlignmentProvider';
import { AlignmentTrackFactory } from '../../saguaro-3d/alignment-track-factory';
import { ColorLists, convertHexToRgb } from '../../utils/color';
import { exportHierarchy } from 'molstar/lib/extensions/model-export/export';
import { StructuralAlignmentColorThemeProvider } from '../../saguaro-3d/molstar-trajectory/alignment-color-theme';

let panel3D: RcsbFv3DAlignmentProvider;
export function StructureViewComponent(props: { ctx: ApplicationContext }) {
    useEffect(() => {
        if (props.ctx.state.events.status.getValue() === 'ready' && props.ctx.state.data.response.state?.results) {
            const alignmentResponse = props.ctx.state.data.response.state;
            if (alignmentResponse.results) {
                const alignmentReference = new AlignmentReference();
                alignmentReference.init(alignmentResponse.results)
                    .then(() => {
                        const dataProvider: RcsbModuleDataProviderInterface = {
                            alignments: {
                                collector: new RcsbStructuralAlignmentCollector(alignmentResponse, alignmentReference),
                                context: {
                                    queryId: 'structural-alignment',
                                    to: SequenceReference.PdbInstance
                                },
                                trackFactories: {
                                    alignmentTrackFactory: new AlignmentTrackFactory(alignmentReference.alignmentCloseResidues())
                                }
                            }
                        };
                        panel3D?.unmount();

                        let index = 0;
                        panel3D = new RcsbFv3DAlignmentProvider({
                            elementId: '1d-3d-div',
                            config: {
                                dataProvider: dataProvider,
                                loadParamsProvider: new RcsbLoadParamsProvider(
                                    alignmentResponse,
                                    alignmentReference
                                ),
                                additionalContent: () => <></>
                            },
                            additionalConfig: {
                                boardConfig: {
                                    rowTitleWidth: 110,
                                    disableMenu: true
                                },
                                trackConfigModifier: {
                                    alignment: ()=> {
                                        const color = convertHexToRgb(ColorLists['set-1'][index++], 0.8);
                                        return Promise.resolve({
                                            titleFlagColor: color
                                        });
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

                        panel3D.render().then(() => {
                            panel3D.pluginCall(plugin => {
                                (panel3D as unknown as {downloadSubscription: Subscription}).downloadSubscription = props.ctx.state.events.download.subscribe(() => exportHierarchy(plugin, { format: 'cif' }));
                                // Hides / Displays molstar tooltip on panel expansion
                                plugin.layout.events.updated.subscribe(() => {
                                    const tooltip = (document.getElementsByClassName('msp-highlight-toast-wrapper').item(0) as HTMLElement);
                                    if (plugin.layout.state.isExpanded)
                                        tooltip.style.visibility = 'visible';
                                    else
                                        tooltip.style.visibility = 'hidden';
                                });
                                // Alignment data will be available for Mol* visualization
                                (plugin.customState as { alignmentData: Map<string, CloseResidues> }).alignmentData = alignmentReference.alignmentCloseResidues();
                                if (!plugin.representation.structure.themes.colorThemeRegistry.has(StructuralAlignmentColorThemeProvider))
                                    plugin.representation.structure.themes.colorThemeRegistry.add(StructuralAlignmentColorThemeProvider);
                            });
                        });
                    });
            }
        } else {
            setTimeout(() => panel3D?.unmount());
            (panel3D as unknown as {downloadSubscription: Subscription})?.downloadSubscription?.unsubscribe();
        }
    });

    return <div id={'1d-3d-div'} style={{ height: 515, marginTop: 10 }}></div>;
}
