import { Subscription } from 'rxjs';
import { useEffect } from 'react';

import { ApplicationContext } from '../../context';
import { AlignmentReference, ResidueCollection } from '../../saguaro-3d/alignment-reference';
import {
    RcsbModuleDataProviderInterface
} from '@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvModule/RcsbFvModuleInterface';
import {
    RcsbLoadParamsProvider,
    RcsbStructuralAlignmentCollector
} from '../../saguaro-3d/alignment-collector';
import { SequenceReference } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { RcsbFv3DAlignmentProvider } from '@rcsb/rcsb-saguaro-3d/lib/RcsbFv3D/RcsbFv3DAlignmentProvider';
import { AlignmentTrackFactory } from '../../saguaro-3d/alignment-track-factory';
import { DefaultOpasityValue, getAlignmentColorRgb } from '../../utils/color';
import { exportHierarchy } from 'molstar/lib/extensions/model-export/export';
import { CloseResidueAlignmentColorThemeProvider, HomogenousAlignmentColorThemeProvider } from '../../saguaro-3d/molstar-trajectory/alignment-color-theme';
import { SequenceTooltip } from '../../utils/sequence-tooltip';

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
                                    alignmentTrackFactory: new AlignmentTrackFactory(alignmentReference)
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
                                    disableMenu: true,
                                    tooltipGenerator: new SequenceTooltip()
                                },
                                trackConfigModifier: {
                                    alignment: ()=> {
                                        const color = getAlignmentColorRgb(index++, DefaultOpasityValue);
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
                                (plugin.customState as { alignmentData: Map<string, ResidueCollection> }).alignmentData = alignmentReference.alignmentCloseResidues();
                                if (!plugin.representation.structure.themes.colorThemeRegistry.has(CloseResidueAlignmentColorThemeProvider))
                                    plugin.representation.structure.themes.colorThemeRegistry.add(CloseResidueAlignmentColorThemeProvider);
                                if (!plugin.representation.structure.themes.colorThemeRegistry.has(HomogenousAlignmentColorThemeProvider))
                                    plugin.representation.structure.themes.colorThemeRegistry.add(HomogenousAlignmentColorThemeProvider);
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
