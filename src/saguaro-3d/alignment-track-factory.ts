import {
    TrackFactoryInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryInterface';
import {
    AlignmentRequestContextType
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/TrackFactoryImpl/AlignmentTrackFactory';
import { TargetAlignment } from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { RcsbFvDisplayTypes, RcsbFvRowConfigInterface } from '@rcsb/rcsb-saguaro';
import { PlainAlignmentTrackFactory } from '@rcsb/rcsb-saguaro-app';
import { ResidueCollection } from './alignment-reference';

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
        const alignmetArea = config.displayConfig?.find(dc => dc.displayType === RcsbFvDisplayTypes.BLOCK_AREA);
        if (!alignmetArea) return config;

        alignmetArea.displayData?.forEach(data => {
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
        alignmetArea.displayColor = {
            colors: ['#dcdcdc', '#dadada', '#d9d9ff', '#a8a8fd'],
            thresholds: [25, 50, 90]
        };
        return config;
    }
}