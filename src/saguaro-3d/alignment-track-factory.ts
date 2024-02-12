import {
    TrackFactoryInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface';
import {
    AlignmentRequestContextType
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory';
import { TargetAlignment } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { RcsbFvDisplayTypes, RcsbFvRowConfigInterface } from '@rcsb/rcsb-saguaro';
import { PlainAlignmentTrackFactory } from '@rcsb/rcsb-saguaro-app';
import { CloseResidues } from './alignment-reference';

export class AlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]> {

    // key is alignmentId
    private readonly alignmentMap: Map<string, CloseResidues>;
    private readonly plainAlignmentTrackFactory: PlainAlignmentTrackFactory = new PlainAlignmentTrackFactory();

    constructor(map: Map<string, CloseResidues>) {
        this.alignmentMap = map;
    }

    async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<RcsbFvRowConfigInterface> {
        const config = await this.plainAlignmentTrackFactory.getTrack(alignmentRequestContext, targetAlignment);
        const alignmetArea = config.displayConfig?.find(dc => dc.displayType === RcsbFvDisplayTypes.BLOCK_AREA);
        if (!alignmetArea) return config;

        alignmetArea.displayData?.forEach(data => {
            if (data.value === 100
                && this.alignmentMap.has(data.sourceId ?? '')
                && !this.alignmentMap.get(data.sourceId ?? '')?.labelSeqIds.includes(data.oriBegin ?? -1))
                data.value = 75;
        });
        alignmetArea.displayColor = {
            colors: ['#dcdcdc', '#d9d9ff', '#a8a8fd'],
            thresholds: [50, 90]
        };
        return config;
    }
}