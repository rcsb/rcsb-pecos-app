import {
    AlignmentResponse,
} from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import {
    AlignmentCollectConfig,
    AlignmentCollectorInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface';
import { RcsbRequestContextManager } from '@rcsb/rcsb-saguaro-app';


import { AlignmentReference } from './AlignmentReference';
import {
    LocationProviderInterface,
    RigidTransformType, TransformMatrixType,
    TransformProviderInterface
} from '@rcsb/rcsb-saguaro-3d/build/dist/RcsbFvStructure/StructureUtils/StructureLoaderInterface';
import {
    InstanceSequenceInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/DataCollectors/MultipleInstanceSequencesCollector';
import { Alignment, AlignmentRegion, StructureAlignmentResponse } from '../auto/alignment/alignment-response';

export class RcsbStructuralAlignmentProvider implements AlignmentCollectorInterface {

    private alignmentResponse: AlignmentResponse | undefined = undefined;
    private readonly alignment: StructureAlignmentResponse;
    constructor(alignment: StructureAlignmentResponse) {
        this.alignment = alignment;
    }

    async collect(requestConfig: AlignmentCollectConfig, filter?: Array<string>): Promise<AlignmentResponse> {
        return new Promise((resolve)=>{
            this.data().then((d)=>resolve(d));
        });
    }
    async getTargets(): Promise<string[]> {
        return new Promise((resolve)=>{
            this.data().then((d)=>resolve(d.target_alignment?.map(ta=>ta?.target_id ?? 'NA') ?? []));
        });
    }
    async getAlignmentLength(): Promise<number> {
        return new Promise((resolve)=>{
            this.data().then(d=>{
                const ends = d.target_alignment?.map(ta=>ta?.aligned_regions?.[ta?.aligned_regions?.length - 1]?.query_end);
                resolve(Math.max(...(ends as number[])));
            });
        });
    }
    async getAlignment(): Promise<AlignmentResponse> {
        return new Promise((resolve)=>{
            this.data().then(d=>resolve(d));
        });
    }
    private async data(): Promise<AlignmentResponse> {
        if (this.alignmentResponse)
            return this.alignmentResponse;
        return new Promise((resolve)=>{
            alignmentTransform(this.alignment).then(ar=>{
                this.alignmentResponse = ar;
                resolve(ar);
            });
        });
    }

}

export class RcsbStructuralTransformProvider implements TransformProviderInterface {

    private readonly alignment: StructureAlignmentResponse;
    constructor(alignment: StructureAlignmentResponse) {
        this.alignment = alignment;
    }

    get(entryId: string, asymId?: string): RigidTransformType[] {
        const res = this.alignment.results?.find(res=>{
            const r = res.structures[1];
            return ('entry_id' in r && r.entry_id === entryId && r.selection && 'asym_id' in r.selection && r.selection.asym_id === asymId) || ('name' in r && r.name === entryId && r.selection && 'asym_id' in r.selection && r.selection.asym_id === asymId);
        });
        if (res?.structure_alignment.length === 1) {
            return [{
                transform: res.structure_alignment[0].transformations[1] as TransformMatrixType
            }];
        } else if (res?.structure_alignment.length && res?.structure_alignment.length > 1) {
            return res.structure_alignment.map(sa=>({
                transform: sa.transformations[1] as TransformMatrixType,
                regions: sa.regions?.[1].map(r=>[r.beg_seq_id, r.beg_seq_id + r.length - 1])
            }));
        } else {
            return [{
                transform: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
            }];
        }
    }

}

export class RcsbStructureLocationProvider implements LocationProviderInterface {

    private readonly alignment: StructureAlignmentResponse;
    constructor(alignment: StructureAlignmentResponse) {
        this.alignment = alignment;
    }

    get(entryId: string): string|undefined {
        for (const res of this.alignment.results ?? []) {
            if ('url' in res.structures[0] && res.structures[0].url && res.structures[0].name === entryId) {
                return res.structures[0].url;
            }
            if ('url' in res.structures[1] && res.structures[1].url && res.structures[1].name === entryId) {
                return res.structures[1].url;
            }
        }
        return undefined;
    }

}

async function alignmentTransform(alignment: StructureAlignmentResponse): Promise<AlignmentResponse> {
    if (!alignment.results)
        return {};
    const alignmentRef = await mergeAlignments(alignment.results);
    const out: AlignmentResponse = alignmentRef.buildAlignments();
    const seqs = await getSequences(alignment.results);
    out.target_alignment?.forEach(ta=>{
        const seq = seqs.find(s=>s.rcsbId === ta?.target_id)?.sequence;
        if (seq && ta)
            ta.target_sequence = seq;
    });
    return out;
}

async function mergeAlignments(results: Alignment[]): Promise<AlignmentReference> {
    const result = results[0];
    if (!result)
        throw new Error('Results not available');
    const seqs = await getSequences([result]);
    const alignmentRef = new AlignmentReference(getInstanceId(result, 0), seqs[0].sequence.length);
    results.forEach(result=>{
        if (result.sequence_alignment)
            alignmentRef.addAlignment(getInstanceId(result), transformToGapedDomain(result.sequence_alignment[0].regions), transformToGapedDomain(result.sequence_alignment[1].regions));
        else if (result.structure_alignment && result.structure_alignment[0].regions && result.structure_alignment[1].regions)
            alignmentRef.addAlignment(getInstanceId(result), transformToGapedDomain(result.structure_alignment[0].regions.flat()), transformToGapedDomain(result.structure_alignment[1].regions.flat()));
    });
    return alignmentRef;
}

function getInstanceId(result: Alignment, index: 0|1 = 1): string {
    const res = result.structures[index];
    if ('entry_id' in res && res.entry_id && res.selection && 'asym_id' in res.selection)
        return `${res.entry_id}.${res.selection.asym_id}`;
    else if ('name' in res && res.selection && 'asym_id' in res.selection)
        return `${res.name}.${res.selection.asym_id}`;
    throw new Error('Missing entry_id and name from result');
}

function transformToGapedDomain(regions: AlignmentRegion[]): (number|undefined)[] {
    const out: (number|undefined)[] = [];
    let prevRegionEnd = 0;
    regions.forEach(region=>{
        const beg = region.beg_index + 1;
        const end = region.beg_index + region.length;
        if (beg > (prevRegionEnd + 1)) {
            const nGaps = beg - (prevRegionEnd + 1);
            out.push(...Array(nGaps).fill(undefined));
        }
        prevRegionEnd = end;
        const seqBeg = region.beg_seq_id;
        const seqEnd = region.beg_seq_id + region.length - 1;
        for (let i = seqBeg; i <= seqEnd; i++) {
            out.push(i);
        }
    });
    return out;
}

async function getSequences(results: Alignment[]): Promise<InstanceSequenceInterface[]> {
    const out: InstanceSequenceInterface[] = [];
    const missingIds: string[] = [];
    const res = results[0];
    if (res.sequence_alignment?.[0].sequence) {
        out.push({
            rcsbId: getInstanceId(res, 0),
            sequence: res.sequence_alignment[0].sequence
        });
    } else {
        missingIds.push(getInstanceId(res, 0));
    }
    results.forEach(res=>{
        if (res.sequence_alignment?.[1].sequence) {
            out.push({
                rcsbId: getInstanceId(res, 1),
                sequence: res.sequence_alignment[1].sequence
            });
        } else {
            missingIds.push(getInstanceId(res));
        }
    });
    return out.concat(await RcsbRequestContextManager.getInstanceSequences(missingIds));
}

