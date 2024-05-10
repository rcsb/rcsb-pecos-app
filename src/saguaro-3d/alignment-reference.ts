import { cloneDeep } from 'lodash';
import {
    AlignedRegion,
    AlignmentResponse,
} from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import { rcsbRequestCtxManager as RcsbRequestContextManager } from '@rcsb/rcsb-saguaro-app/lib/RcsbRequest/RcsbRequestContextManager';
import { TagDelimiter } from '@rcsb/rcsb-api-tools/build/RcsbUtils/TagDelimiter';
import {
    InstanceSequenceInterface
} from '@rcsb/rcsb-saguaro-app/lib/RcsbCollectTools/DataCollectors/MultipleInstanceSequencesCollector';
import { Alignment, AlignmentRegion } from '../auto/alignment/alignment-response';

type AlignmentRefType = (number|undefined)[];
type AlignmentMemberType = {
    id: string;
    map: AlignmentRefType;
    ref: AlignmentRefType;
    target: AlignmentRefType;
};

export type AlignmentMapType = {
    entryId: string;
    instanceId: string;
    alignmentModelIndex: number;
    alignmentId: string;
    sequence: string;
    alignmentIndex: number;
    pairIndex: number;
    alignment: Alignment;
};

export type ResidueCollection = {
    asymId: string
    labelSeqIds: number[]
}

export class AlignmentReference {

    private alignmentRefMap: AlignmentRefType = [];
    private refId = 'none';
    private alignmentRefGaps: Record<number, number> = {};
    private memberRefList: AlignmentMemberType[] = [];
    private readonly alignmentMap = new Map<string, AlignmentMapType>();

    public async init(results: Alignment[]) {
        this.alignmentMap.clear();
        this.alignmentRefMap = [];
        this.alignmentRefGaps = {};
        const result = results[0];
        this.refId = this.addUniqueAlignmentId(result, 0, 0);
        const length = (await this.getSequences())[0].sequence.length;
        this.alignmentRefMap = Array(length).fill(0).map((v, n)=>n + 1);
        results.forEach((result, n) => {
            this.addUniqueAlignmentId(result, n);
        });
        await this.mergeAlignments(results);
    }

    public addAlignment(id: string, refAlignment: AlignmentRefType, target: AlignmentRefType): void {
        const gaps = findGaps(refAlignment);
        for (const gapBeg in gaps) {
            if (gapBeg === '0')
                continue;
            if (this.alignmentRefGaps[gapBeg])
                this.extendGap(parseInt(gapBeg), gaps[gapBeg]);
            else
                this.addGap(parseInt(gapBeg), gaps[gapBeg]);
        }
        const beg = refAlignment.filter(a=>(a && this.alignmentRefMap[0] && a < this.alignmentRefMap[0])) as number[];
        if (beg.length > 0)
            this.addBeg(beg);
        const n = this.alignmentRefMap[this.alignmentRefMap.length - 1] as number;
        const end = refAlignment.filter(a=>(a && n && a > n)) as number[];
        if (end.length > 0)
            this.addEnd(end);
        this.addRef(id, refAlignment, target);
    }

    public buildAlignments(): AlignmentResponse {
        return buildAlignments(this.refId, this.alignmentRefMap, this.memberRefList.slice(1));
    }

    public alignmentCloseResidues(): Map<string, ResidueCollection> {

        const out: Map<string, ResidueCollection> = new Map<string, ResidueCollection>();

        this.getMapAlignments().slice(1).forEach(alignment => {

            const key = alignment.alignmentId;
            const results = alignment.alignment;

            if (!out.has(key)) {
                out.set(key, {
                    asymId: alignment.instanceId,
                    labelSeqIds: []
                });
            }
            results.structure_alignment.map(sa => sa.regions?.[1]).flat().forEach(reg=>{
                if (!reg)
                    return;
                for (let n = 0; n < reg.length; n++) {
                    out.get(key)?.labelSeqIds.push(reg.beg_seq_id + n);
                }
            });

            const ref = this.getMapAlignments()[0];
            const refKey = ref.alignmentId;
            if (!out.has(refKey))
                out.set(refKey, {
                    asymId: ref.instanceId,
                    labelSeqIds: []
                });
            results.structure_alignment.map(sa => sa.regions?.[0]).flat().forEach(reg=>{
                if (!reg)
                    return;
                for (let n = 0; n < reg.length; n++) {
                    out.get(refKey)?.labelSeqIds.push(reg.beg_seq_id + n);
                }
            });
        });
        return out;
    }

    public unalignedResidues(): Map<string, ResidueCollection> {
        const out: Map<string, ResidueCollection> = new Map<string, ResidueCollection>();
        const ref = this.getMapAlignments()[0];
        const unobserved = this.alignmentRefMap.filter((resId, index) => {
            if (!resId)
                return false;
            return this.memberRefList.slice(1).filter(memberRef => {
                return ((memberRef.map[index]) !== undefined && memberRef.target[memberRef.map[index] as number] !== undefined);
            }).length === 0;
        });
        out.set(ref.alignmentId, {
            asymId: ref.instanceId,
            labelSeqIds: unobserved as number[]
        });
        this.memberRefList.slice(1).forEach((memberRef, index)=> {
            const ref = this.getMapAlignments()[index + 1];
            const unobserved = memberRef.map
                .filter((resId, index) => {
                    return resId !== undefined && this.alignmentRefMap[index] === undefined;
                })
                .map(
                    resId => memberRef.target[resId as number]
                );
            out.set(ref.alignmentId, {
                asymId: ref.instanceId,
                labelSeqIds: unobserved as number[]
            });
        });
        return out;
    }

    public getAlignmentEntry(alignmentId: string): AlignmentMapType {
        const pdb = this.alignmentMap.get(alignmentId);
        if (pdb) return pdb;
        throw new Error('Alignment Id not found');
    }

    public getMapAlignments(): AlignmentMapType[] {
        return Array.from(this.alignmentMap.values());
    }

    public async getSequences(): Promise<InstanceSequenceInterface[]> {
        const out = Array.from(this.alignmentMap.values()).filter(v=>v.sequence.length > 0).map(v=>({
            rcsbId: v.alignmentId,
            sequence: v.sequence
        }));
        const missingSeq = await RcsbRequestContextManager.getInstanceSequences(
            Array.from(this.alignmentMap.values()).filter(v=>v.sequence.length === 0).map(
                v=>`${v.entryId}${TagDelimiter.instance}${v.instanceId}`
            ).filter((value, index, list)=> list.indexOf(value) === index)
        );
        return out.concat(
            Array.from(this.alignmentMap.values()).filter(v=>v.sequence.length === 0).map(v=>({
                rcsbId: v.alignmentId,
                sequence: missingSeq.find(s=>s.rcsbId === `${v.entryId}${TagDelimiter.instance}${v.instanceId}`)?.sequence ?? ''
            }))
        );
    }

    private addUniqueAlignmentId(alignment: Alignment, alignmentIndex: number, pairIndex: 0|1 = 1): string {
        const structure = alignment.structures[pairIndex];
        if (!structure.selection)
            throw new Error('Missing entry_id and name from result');
        let entryId: string | undefined = undefined;
        const asymId = 'asym_id' in structure.selection ? structure.selection.asym_id : undefined;
        if ('entry_id' in structure && structure.entry_id && structure.selection && 'asym_id' in structure.selection)
            entryId = structure.entry_id;
        else if ('name' in structure && structure.selection && 'asym_id' in structure.selection)
            entryId = structure.name;
        if (!entryId || !asymId)
            throw new Error('Missing entry_id and name from result');

        const alignmentId = `${entryId}${TagDelimiter.instance}${asymId}`;

        const alignmentModelIndex = (pairIndex === 0) ? 0 : alignmentIndex + 1;

        if (!this.alignmentMap.has(alignmentId)) {
            this.alignmentMap.set(alignmentId, {
                entryId,
                instanceId: asymId,
                alignmentModelIndex: alignmentModelIndex,
                sequence: alignment.sequence_alignment?.[pairIndex].sequence ?? '',
                alignmentIndex: alignmentIndex,
                pairIndex: pairIndex,
                alignmentId: alignmentId,
                alignment: alignment
            });
            return alignmentId;
        } else {
            let tag = 1;
            while (this.alignmentMap.has(`${entryId}[${tag}]${TagDelimiter.instance}${asymId}`)) {
                tag ++;
            }
            this.alignmentMap.set(`${entryId}[${tag}]${TagDelimiter.instance}${asymId}`, {
                entryId,
                instanceId: asymId,
                alignmentModelIndex: alignmentModelIndex,
                sequence: alignment.sequence_alignment?.[pairIndex].sequence ?? '',
                alignmentIndex: alignmentIndex,
                pairIndex: pairIndex,
                alignmentId: `${entryId}[${tag}]${TagDelimiter.instance}${asymId}`,
                alignment: alignment
            });
            return `${entryId}[${tag}]${TagDelimiter.instance}${asymId}`;
        }
    }

    private addRef(id: string, refAlignment: AlignmentRefType, target: AlignmentRefType): void {
        const map: AlignmentRefType = Array(this.alignmentRefMap.length).fill(undefined);
        refAlignment.forEach((v, n)=>{
            if (v === undefined)
                return;
            const index = this.alignmentRefMap.findIndex(e=>e === v);
            if (index >= 0)
                map[index] = n;
        });
        const gaps = findGaps(refAlignment);
        for (const gapBeg in gaps) {
            const index = this.alignmentRefMap.findIndex(v=>v === parseInt(gapBeg));
            for (let i = 1; i <= gaps[gapBeg]; i++) {
                map[index + i] = (map[index] as number) + i;
            }
        }
        this.memberRefList.push({
            id,
            map,
            ref: cloneDeep(refAlignment),
            target: cloneDeep(target)
        });
    }

    private addEnd(indexList: number[]): void {
        const last = this.alignmentRefMap.length;
        this.alignmentRefMap.splice(last, 0, ...indexList);
        this.memberRefList.forEach(mr=>{
            mr.map.splice(last, 0, ...Array(indexList.length).fill(undefined));
        });
    }

    private addBeg(indexList: number[]): void {
        this.alignmentRefMap.splice(0, 0, ...indexList);
        this.memberRefList.forEach(mr=>{
            mr.map.splice(0, 0, ...Array(indexList.length).fill(undefined));
        });
    }

    private addGap(gapBeg: number, gapLength: number): void {
        this.alignmentRefGaps[gapBeg] = gapLength;
        const i = this.alignmentRefMap.findIndex((v)=>v === gapBeg) + 1;
        this.alignmentRefMap.splice(i, 0, ...Array(gapLength).fill(undefined));
        this.memberRefList.forEach(mr=>{
            mr.map.splice(i, 0, ...Array(gapLength).fill(undefined));
        });
    }

    private extendGap(gapBeg: number, gapLength: number): void {
        if (!this.alignmentRefGaps[gapBeg] || this.alignmentRefGaps[gapBeg] >= gapLength)
            return;
        const delta = gapLength - this.alignmentRefGaps[gapBeg];
        this.alignmentRefGaps[gapBeg] += delta;
        const i = this.alignmentRefMap.findIndex((v)=>v === gapBeg) + 1;
        this.alignmentRefMap.splice(i, 0, ...Array(delta).fill(undefined));
        this.memberRefList.forEach(mr=>{
            mr.map.splice(i, 0, ...Array(delta).fill(undefined));
        });
    }

    private async mergeAlignments(results: Alignment[]): Promise<void> {
        const result = results[0];
        if (!result)
            throw new Error('Results not available');
        this.getMapAlignments().forEach((alignment)=>{
            const result = alignment.alignment;
            const alignmentId = alignment.alignmentId;
            if (result.sequence_alignment)
                this.addAlignment(alignmentId, transformToGapedDomain(result.sequence_alignment[0].regions), transformToGapedDomain(result.sequence_alignment[1].regions));
            else if (result.structure_alignment && result.structure_alignment[0].regions && result.structure_alignment[1].regions)
                this.addAlignment(alignmentId, transformToGapedDomain(result.structure_alignment[0].regions.flat()), transformToGapedDomain(result.structure_alignment[1].regions.flat()));
        });
    }

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

function buildAlignments(refId: string, alignmentRefMap: AlignmentRefType, alignmentMembers: AlignmentMemberType[]): AlignmentResponse {
    const out: AlignmentResponse = {};
    out.target_alignment = [];
    out.target_alignment.push({
        aligned_regions: buildRegions(alignmentRefMap),
        target_id: refId
    });
    alignmentMembers.forEach(am=>{
        out.target_alignment?.push({
            target_id: am.id,
            aligned_regions: buildRegions(am.map.map((v)=> typeof v === 'number' ? am.target[v] : undefined))
        });
    });
    return out;
}

function buildRegions(alignment: AlignmentRefType): AlignedRegion[] {
    const out: AlignedRegion[] = [];
    let begIndex = 0;
    let begPos = 0;
    alignment.forEach((v, n)=>{
        if (!v) {
            if (begIndex > 0) {
                out.push({
                    query_begin: begIndex,
                    target_begin: begPos,
                    query_end: n,
                    target_end: begPos + (n - begIndex)
                });
                begIndex = 0;
                begPos = 0;
            }
        } else {
            if (begIndex === 0) {
                begIndex = n + 1;
                begPos = v;
            }
        }
    });
    if (begPos > 0) {
        const n = alignment.length;
        out.push({
            query_begin: begIndex,
            target_begin: begPos,
            query_end: n,
            target_end: alignment[n - 1] as number
        });
    }
    return out;
}

function findGaps(alignment: AlignmentRefType): Record<number, number> {
    const out: Record<number, number> = {};
    let gapBeg = 0;
    let gapLength = 0;
    alignment.forEach((v, n)=>{
        if (!v) {
            if (gapBeg === 0 && typeof alignment[n - 1] === 'number')
                gapBeg = alignment[n - 1] as number;
            gapLength++;
        } else {
            if (gapLength > 0) {
                out[gapBeg] = gapLength;
                gapBeg = 0;
                gapLength = 0;
            }
        }
    });
    if (gapLength > 0)
        out[gapBeg] = gapLength;
    return out;
}