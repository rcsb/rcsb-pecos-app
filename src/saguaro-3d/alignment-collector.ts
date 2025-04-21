import { SequenceAlignments } from '@rcsb/rcsb-api-tools/lib/RcsbGraphQL/Types/Borrego/GqlTypes';
import { AlignmentCollectorInterface } from '@rcsb/rcsb-saguaro-app/lib/RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface';
import { TagDelimiter } from '@rcsb/rcsb-api-tools/lib/RcsbUtils/TagDelimiter';

import { AlignmentReference } from './alignment-reference';
import {
    LoadParamsProviderInterface,
    RigidTransformType,
    TransformMatrixType
} from '@rcsb/rcsb-saguaro-3d/lib//RcsbFvStructure/StructureUtils/StructureLoaderInterface';

import {
    StructureAlignmentResponse,
    StructureEntry,
    StructureURL
} from '../auto/alignment/alignment-response';
import {
    LoadMethod,
    LoadMolstarInterface,
    LoadMolstarReturnType
} from '@rcsb/rcsb-saguaro-3d/lib//RcsbFvStructure/StructureViewers/MolstarViewer/MolstarActionManager';
import {
    AlignmentTrajectoryParamsType,
    AlignmentTrajectoryPresetProvider
} from './molstar-trajectory/alignment-trajectory-preset-provider';


export class RcsbStructuralAlignmentCollector implements AlignmentCollectorInterface {

    private alignmentResponse: SequenceAlignments | undefined = undefined;
    private readonly alignment: StructureAlignmentResponse;
    private readonly alignmentReference: AlignmentReference;

    constructor(alignment: StructureAlignmentResponse, alignmentReference: AlignmentReference) {
        this.alignment = alignment;
        this.alignmentReference = alignmentReference;
    }

    async collect(): Promise<SequenceAlignments> {
        return await this.data();
    }
    async getTargets(): Promise<string[]> {
        return (await this.data()).target_alignments?.map(ta=>ta?.target_id ?? 'NA') ?? [];
    }
    async getAlignmentLength(): Promise<number> {
        return Math.max(...(await this.data()).target_alignments?.map(ta=>ta?.aligned_regions?.[ta?.aligned_regions?.length - 1]?.query_end ?? -1) ?? []);
    }
    async getAlignment(): Promise<SequenceAlignments> {
        return await this.data();
    }
    private async data(): Promise<SequenceAlignments> {
        if (!this.alignmentResponse) {
            if (!this.alignment.results)
                return {};
            this.alignmentResponse = await this.alignmentTransform();
        }
        return this.alignmentResponse;
    }

    private async alignmentTransform(): Promise<SequenceAlignments> {
        const out: SequenceAlignments = this.alignmentReference.buildAlignments();
        const seqs = await this.alignmentReference.getSequences();
        out.target_alignments?.forEach(ta => {
            const seq = seqs.find(s => s.rcsbId === ta?.target_id)?.sequence;
            if (seq && ta)
                ta.target_sequence = seq;
        });
        return out;
    }
}

class RcsbStructuralTransformProvider {

    private readonly alignment: StructureAlignmentResponse;
    constructor(alignment: StructureAlignmentResponse) {
        this.alignment = alignment;
    }

    get(alignmentIndex: number, pairIndex: number): RigidTransformType[] {

        const res = this.alignment.results?.[alignmentIndex];
        if (res?.structure_alignment.length === 1) {
            return [{
                transform: res.structure_alignment[0].transformations[pairIndex] as TransformMatrixType
            }];
        } else if (res?.structure_alignment.length && res?.structure_alignment.length > 1) {
            return res.structure_alignment.map(sa=>({
                transform: sa.transformations[pairIndex] as TransformMatrixType,
                regions: sa.regions?.[pairIndex].map(r=>[r.beg_seq_id, r.beg_seq_id + r.length - 1])
            }));
        } else {
            return [{
                transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            }];
        }
    }

}

export class RcsbLoadParamsProvider implements LoadParamsProviderInterface<{entryId: string; instanceId: string;}, LoadMolstarInterface<AlignmentTrajectoryParamsType, LoadMolstarReturnType>> {

    private readonly alignment: StructureAlignmentResponse;
    private readonly transformProvider: RcsbStructuralTransformProvider;
    private readonly alignmentReference: AlignmentReference;

    constructor(alignment: StructureAlignmentResponse, alignmentReference: AlignmentReference) {
        this.alignment = alignment;
        this.transformProvider = new RcsbStructuralTransformProvider(alignment);
        this.alignmentReference = alignmentReference;
    }

    get(pdb: {
        entryId: string;
        instanceId: string;
    }): LoadMolstarInterface<AlignmentTrajectoryParamsType, LoadMolstarReturnType> {

        if (!this.alignment.results)
            throw new Error('Alignments results not found');

        const alignmentId = `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`;
        const { alignmentIndex, pairIndex, entryId, alignmentModelIndex } = this.alignmentReference.getAlignmentEntry(alignmentId);

        const results = this.alignment.results[alignmentIndex];
        const structure = results.structures[pairIndex] as StructureEntry & StructureURL;
        const transform = this.transformProvider.get(alignmentIndex, pairIndex);
        const reprProvider = AlignmentTrajectoryPresetProvider;
        const loadMethod = 'url' in structure && structure.url ? LoadMethod.loadStructureFromUrl : LoadMethod.loadPdbId;
        const url: string|undefined = 'url' in structure && structure.url ? structure.url : undefined;
        return {
            loadMethod,
            loadParams: {
                url,
                entryId,
                format: structure.format,
                isBinary: structure.is_binary,
                id: alignmentId,
                reprProvider: reprProvider,
                params: {
                    pdb,
                    alignmentId,
                    modelIndex: alignmentModelIndex,
                    transform: transform,
                    targetAlignment: undefined
                }
            }
        };
    }
}
