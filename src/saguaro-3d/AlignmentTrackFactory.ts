import {
    TrackFactoryInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface';
import {
    AlignmentRequestContextType
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory';
import { TargetAlignment } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { RcsbFvDisplayTypes, RcsbFvRowConfigInterface } from '@rcsb/rcsb-saguaro';
import { PlainAlignmentTrackFactory } from '@rcsb/rcsb-saguaro-app';

export class AlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]> {

    private readonly plainAlignmentTrackFactory: PlainAlignmentTrackFactory = new PlainAlignmentTrackFactory();
    private readonly closeResidues: Map<string, Set<number>>;

    constructor(closeResidues: Map<string, Set<number>>) {
        this.closeResidues = closeResidues;
    }
    async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<RcsbFvRowConfigInterface> {
        const config = await this.plainAlignmentTrackFactory.getTrack(alignmentRequestContext, targetAlignment);
        const alignmetArea = config.displayConfig?.find(dc=>dc.displayType === RcsbFvDisplayTypes.BLOCK_AREA);
        if (!alignmetArea)
            return config;
        alignmetArea.displayData?.forEach(data=>{
            if (data.value === 100 && this.closeResidues.has(data.sourceId ?? '') && !this.closeResidues.get(data.sourceId ?? '')?.has(data.oriBegin ?? -1))
                data.value = 75;
        });
        alignmetArea.displayColor = {
            colors: ['#dcdcdc', '#d9d9ff', '#a8a8fd'],
            thresholds: [50, 90]
        };
        return config;
    }

}