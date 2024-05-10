import {
    TrackFactoryInterface
} from '@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface';
import {
    AlignmentRequestContextType
} from '@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory';
import { TargetAlignment } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { RcsbFvDisplayTypes } from '@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvDefaultConfigValues';
import { ResidueCollection } from './alignment-reference';
import { RcsbFvRowConfigInterface } from '@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvConfig/RcsbFvConfigInterface';
import {
    PlainAlignmentTrackFactory
} from '@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/PlainAlignmentTrackFactory';

interface AlignmentResidueDescription {
    alignmentCloseResidues(): Map<string, ResidueCollection>;
    unalignedResidues(): Map<string, ResidueCollection>;
}

export class AlignmentTrackFactory implements TrackFactoryInterface<[AlignmentRequestContextType, TargetAlignment]> {

    // key is alignmentId
    private readonly alignmentResidueDescription: AlignmentResidueDescription;
    private readonly plainAlignmentTrackFactory: PlainAlignmentTrackFactory = new PlainAlignmentTrackFactory();

    constructor(alignmentResidueDescription: AlignmentResidueDescription) {
        this.alignmentResidueDescription = alignmentResidueDescription;
    }

    async getTrack(alignmentRequestContext: AlignmentRequestContextType, targetAlignment: TargetAlignment): Promise<RcsbFvRowConfigInterface> {
        const closeResidues = this.alignmentResidueDescription.alignmentCloseResidues();
        const unalignedResidues = this.alignmentResidueDescription.unalignedResidues();
        const config = await this.plainAlignmentTrackFactory.getTrack(alignmentRequestContext, targetAlignment);
        const alignmentArea = config.displayConfig?.find(dc => dc.displayType === RcsbFvDisplayTypes.BLOCK_AREA);
        if (!alignmentArea) return config;

        alignmentArea.displayData?.forEach(data => {
            if (
                data.value === 100 &&
                closeResidues.has(data.sourceId ?? '') &&
                !closeResidues.get(data.sourceId ?? '')?.labelSeqIds.includes(data.oriBegin ?? -1)
            )
                data.value = 75;
            if (
                unalignedResidues.has(data.sourceId ?? '') &&
                unalignedResidues.get(data.sourceId ?? '')?.labelSeqIds.includes(data.oriBegin ?? -1)
            )
                data.value = 25;
        });
        alignmentArea.displayColor = {
            colors: ['#dcdcdc', '#dadada', '#d9d9ff', '#a8a8fd'],
            thresholds: [25, 50, 90]
        };
        return config;
    }
}