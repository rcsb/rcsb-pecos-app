import {
    AlignmentResponse,
} from '@rcsb/rcsb-api-tools/build/RcsbGraphQL/Types/Borrego/GqlTypes';
import {
    AlignmentCollectConfig,
    AlignmentCollectorInterface
} from '@rcsb/rcsb-saguaro-app/build/dist/RcsbCollectTools/AlignmentCollector/AlignmentCollectorInterface';
import { TagDelimiter } from '@rcsb/rcsb-saguaro-app';


import { AlignmentMapType, AlignmentReference } from './AlignmentReference';
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
    AlignmentTrajectoryParamsType
} from './molstar-trajectory/AlignmentTrajectoryPresetProvider';
import { ColorLists } from '../utils/color';
import { getTrajectoryPresetProvider as alignmentTrajectory } from './molstar-trajectory/AlignmentTrajectoryPresetProvider';
import { getTrajectoryPresetProvider as flexibleTrajectory } from './molstar-trajectory/FlexibleAlignmentTrajectoryPresetProvider';

export class RcsbStructuralAlignmentProvider implements AlignmentCollectorInterface {

    private alignmentResponse: AlignmentResponse | undefined = undefined;
    private readonly alignment: StructureAlignmentResponse;
    private readonly alignmentReference: AlignmentReference;
    constructor(alignment: StructureAlignmentResponse, alignmentReference: AlignmentReference) {
        this.alignment = alignment;
        this.alignmentReference = alignmentReference;
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
            alignmentTransform(this.alignment, this.alignmentReference).then(ar=>{
                this.alignmentResponse = ar;
                resolve(ar);
            });
        });
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

export class ColorConfig {

    private readonly colorConfig: {closeResidues: Map<string, Set<number>>; colors: Map<string, number>;};
    private readonly idMap: Map<string, string> = new Map<string, string>();
    private readonly uniqueChainMap: Map<string, {asymId: string; operatorName: string;}> = new Map<string, {asymId: string; operatorName: string;}>();
    constructor(colorConfig: {closeResidues: Map<string, Set<number>>; colors: Map<string, number>;}) {
        this.colorConfig = colorConfig;
    }

    public getCloseResidues(modelId: string): Set<number> {
        return this.colorConfig.closeResidues.get(this.idMap.get(modelId) ?? 'none') ?? new Set<number>();
    }

    public getModelColor(modelId: string): number {
        return this.colorConfig.colors.get(this.idMap.get(modelId) ?? 'none') ?? 0x777777;
    }

    public setAlignmentIdToModel(modelId: string, alignmentId: string): void {
        this.idMap.set(modelId, alignmentId);
    }

    public setUniqueChain(modelId: string, asymId: string, operatorName: string): void {
        this.uniqueChainMap.set(modelId, { asymId, operatorName });
    }

    public getUniqueChain(modelId: string): {asymId: string; operatorName: string;} | undefined {
        return this.uniqueChainMap.get(modelId);
    }

}

export class RcsbLoadParamsProvider implements LoadParamsProviderInterface<{entryId: string; instanceId: string;}, LoadMolstarInterface<AlignmentTrajectoryParamsType, LoadMolstarReturnType>> {

    private readonly alignment: StructureAlignmentResponse;
    private readonly transformProvider: RcsbStructuralTransformProvider;
    private readonly alignmentReference: AlignmentReference;
    private readonly colorConfig: ColorConfig;
    constructor(alignment: StructureAlignmentResponse, alignmentReference: AlignmentReference, colorConfig: ColorConfig) {
        this.alignment = alignment;
        this.transformProvider = new RcsbStructuralTransformProvider(alignment);
        this.alignmentReference = alignmentReference;
        this.colorConfig = colorConfig;
    }

    get(pdb: {entryId: string; instanceId: string;}): LoadMolstarInterface<AlignmentTrajectoryParamsType, LoadMolstarReturnType> {
        if (!this.alignment.results)
            throw new Error('Alignments results not found');
        const { alignmentIndex, pairIndex, entryId } = this.alignmentReference.getAlignmentEntry(`${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`);
        const alignmentId = `${pdb.entryId}${TagDelimiter.instance}${pdb.instanceId}`;
        const res = this.alignment.results[alignmentIndex];
        const structure = res.structures[pairIndex] as StructureEntry & StructureURL;
        const transform = this.transformProvider.get(alignmentIndex, pairIndex);
        const reprProvider = !transform?.length || transform.length === 1 ? alignmentTrajectory(
            alignmentId,
            this.colorConfig
        ) : flexibleTrajectory(
            alignmentId,
            this.colorConfig
        );
        const loadMethod = 'url' in structure && structure.url ? LoadMethod.loadStructureFromUrl : LoadMethod.loadPdbId;
        const url: string|undefined = 'url' in structure && structure.url ? structure.url : undefined;
        return {
            loadMethod,
            loadParams: {
                url,
                entryId,
                format: url ? 'mmcif' : undefined,
                isBinary: url ? false : undefined,
                id: alignmentId,
                reprProvider: reprProvider,
                params: {
                    modelIndex: 0,
                    pdb,
                    transform: transform,
                    targetAlignment: undefined
                }
            }
        };
    }
}

async function alignmentTransform(alignment: StructureAlignmentResponse, alignmentRef: AlignmentReference): Promise<AlignmentResponse> {
    if (!alignment.results)
        return {};
    const out: AlignmentResponse = alignmentRef.buildAlignments();
    const seqs = await alignmentRef.getSequences();
    out.target_alignment?.forEach(ta=>{
        const seq = seqs.find(s=>s.rcsbId === ta?.target_id)?.sequence;
        if (seq && ta)
            ta.target_sequence = seq;
    });
    return out;
}

export function alignmentCloseResidues(results: AlignmentMapType[]): Map<string, Set<number>> {
    const out: Map<string, Set<number>> = new Map<string, Set<number>>();
    results.slice(1).forEach(alignment=>{
        const res = alignment.alignment;
        const instanceId = alignment.alignmentId;
        if (!out.has(instanceId))
            out.set(instanceId, new Set<number>());
        res.structure_alignment.map(sa => sa.regions?.[1]).flat().forEach(reg=>{
            if (!reg)
                return;
            for (let n = 0; n < reg.length; n++) {
                out.get(instanceId)?.add(reg.beg_seq_id + n);
            }
        });
        const refId = results[0].alignmentId;
        if (!out.has(refId))
            out.set(refId, new Set<number>());
        res.structure_alignment.map(sa => sa.regions?.[0]).flat().forEach(reg=>{
            if (!reg)
                return;
            for (let n = 0; n < reg.length; n++) {
                out.get(refId)?.add(reg.beg_seq_id + n);
            }
        });
    });
    return out;
}

export function entryColors(results: AlignmentMapType[]): Map<string, number> {
    const out: Map<string, number> = new Map<string, number>();
    results.forEach((res, n)=>{
        const instanceId = res.alignmentId;
        out.set(instanceId, ColorLists['set-1'][n]);
    });
    return out;
}

