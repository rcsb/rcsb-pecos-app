/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Viewer } from '@rcsb/rcsb-molstar/build/src/viewer';
import { AlignmentProps, Mat4 } from '@rcsb/rcsb-molstar/build/src/viewer/helpers/preset';
import {
    ColorLists,
    convertHexToRgb
} from '../utils/color';
import { SelectionOptions } from '../context';
import {
    StructureEntry,
    StructureURL,
    StructureInstanceSelection,
    StructureAlignmentResponse,
    StructureAlignmentMetadata,
    Alignment,
    AlignmentRegion,
    AlignmentGap,
    StructureAlignmentBlock
} from '../auto/alignment/alignment-response';
import {
    RcsbFvDisplayConfigInterface,
    RcsbFvDisplayTypes,
    RcsbFvInterface,
    RcsbFvRowConfigInterface,
    RcsbFvTrackDataElementInterface
} from '@rcsb/rcsb-saguaro';
import {
    isEntry,
    mergeIntervals,
    getTransformationType,
    TransformationType
} from '../utils/helper';
import { getCombinedInstanceId, createInstanceLabel } from '../utils/identifier';
import { DataProvider } from '../provider/data-provider';

export type LoadPdbIdParams = Parameters<typeof Viewer.prototype.loadPdbId>;
export type LoadFromUrlParams = Parameters<typeof Viewer.prototype.loadStructureFromUrl>;
export type LoadStructureParams = LoadPdbIdParams | LoadFromUrlParams;

type Structure = StructureEntry | StructureURL;
type Color = AlignmentProps['colors'][0];
type Target = Exclude<AlignmentProps['targets'], undefined>[0];

type ConfigsParam = Exclude<LoadPdbIdParams[1], undefined>;

type StructureAlignmentRepresentation = {
    structure: Structure,
    matrix?: Mat4,
    alignment: {
        beg_seq_id: number,
        length: number,
        matrix?: Mat4
    }[]
};

type SequenceAlignmentRepresentation = {
    color: string,
    label: string,
    sequence: RcsbFvTrackDataElementInterface[],
    alignment?: DisplayAlignmentRegion[]
}

type DisplayAlignmentRegion = {
    begin: number,
    end?: number
};

interface AlignmentManagerI {
    init(data: DataProvider, response?: StructureAlignmentResponse): void,
    structureParameters(selection: SelectionOptions): LoadStructureParams[],
    sequenceParameters(): RcsbFvInterface[]
}

export class AlignmentManager implements AlignmentManagerI {

    private manager?: AlignmentManagerI;

    async init(data: DataProvider, response?: StructureAlignmentResponse) {

        if (!response || !response.meta || !response.results)
            throw new Error('Illigal application state: structure alignment data is required');

        const mode: StructureAlignmentMetadata['alignment_mode'] = response.meta.alignment_mode;
        if (mode === 'pairwise') {
            this.manager = new PairwiseAlignmentManager();
        } else {
            throw new Error('Unsupported alignment mode ' + mode);
        }
        await this.manager!.init(data, response);
    }

    structureParameters(s: SelectionOptions): LoadStructureParams[] {
        if (!this.manager) throw new Error('Illigal application state: alignment manager is not initialized');
        return this.manager.structureParameters(s);
    }

    sequenceParameters(): RcsbFvInterface[] {
        if (!this.manager) throw new Error('Illigal application state: alignment manager is not initialized');
        return this.manager.sequenceParameters();
    }
}

class PairwiseAlignmentManager implements AlignmentManagerI {
    private type: TransformationType = 'rigid';
    private results: Alignment[] = [];
    private structure: StructureAlignmentRepresentation[] = [];
    private sequence: SequenceAlignmentRepresentation[][] = [];

    async init(data: DataProvider, response?: StructureAlignmentResponse) {
        this.type = getTransformationType(response!.meta!);
        this.results = response!.results!;
        this.parseStructureReference();
        this.parseStructureTargets();
        await this.parseSequenceAlignments(data);
    }

    private parseStructureReference() {
        const alignment: StructureAlignmentRepresentation['alignment'] = [];
        const intervals: number[][] = [];
        for (let i = 0; i < this.results.length; i++) {
            this.results[i].structure_alignment.forEach(block => {
                block.regions![0].forEach(region => {
                    intervals.push([region.beg_seq_id!, region.beg_seq_id! + region.length! - 1]);
                });
            });
        }
        const merged = mergeIntervals(intervals);
        merged.forEach(interval => alignment.push({
            beg_seq_id: interval[0],
            length: interval[1] - interval[0] + 1
        }));
        this.structure.push({
            structure: this.results[0].structures[0],
            matrix: Mat4.identity(),
            alignment: alignment
        });
    }

    private parseStructureTargets() {

        for (let i = 0; i < this.results.length; i++) {
            const member: StructureAlignmentRepresentation = {
                structure: this.results[i].structures[1],
                alignment: []
            };
            if (this.type === 'rigid') {
                member.matrix = Mat4.fromArray(Mat4(), this.results[i].structure_alignment[0].transformations[1], 0);
                member.alignment = this.results[i].structure_alignment[0].regions![1];
            } else {
                for (const block of this.results[i].structure_alignment) {
                    for (const region of block.regions![1]) {
                        member.alignment.push(
                            {
                                beg_seq_id: region.beg_seq_id,
                                length: region.length,
                                matrix: Mat4.fromArray(Mat4(), block.transformations[1], 0)
                            }
                        );
                    }
                }
            }
            this.structure.push(member);
        }
    }

    private async parseSequenceAlignments(provider: DataProvider) {
        // interate over alignment solutions
        for (let i = 0; i < this.results.length; i++) {
            const data = this.results[i];
            const structures = data.structures;
            const blocks = data.structure_alignment;
            const alignment = data.sequence_alignment!;
            // interate over members
            const members: SequenceAlignmentRepresentation[] = [];
            for (let j = 0; j < alignment.length; j++) {
                const a = alignment[j];
                const label = await memebrLabel(structures[j], provider);
                const positions = toPositions(a.regions, a.gaps);
                annotateEQRs(positions, blocks, j);
                annotateOneLetterCodes(positions, a.sequence!);
                members.push({
                    color: memberColor(getMemberIndex(i, j)),
                    label: label,
                    sequence: toSequence(positions, label),
                    alignment: toAlignmentBlocks(positions)
                });
            }
            this.sequence.push(members);
        }
    }

    structureParameters(sele: SelectionOptions): LoadStructureParams[] {
        const params: LoadStructureParams[] = [];
        this.structure.forEach((a, i) => params.push(createStructureParams(i, a, sele)));
        return params;
    }

    sequenceParameters(): RcsbFvInterface[] {
        const configs: RcsbFvInterface[] = [];
        this.sequence.forEach((a, i) => configs.push(createSequenceParams(i, a)));
        return configs;
    }
}

// STRUCTURE

const toPropsTargets = (a: StructureAlignmentRepresentation, opt: SelectionOptions): Target[] => {
    const targets: Target[] = [];
    const sele = a.structure.selection as StructureInstanceSelection;
    switch (opt) {
        case 'structure':
            break;
        case 'polymer':
            targets.push({
                labelAsymId: sele.asym_id
            });
            break;
        case 'residues':
            for (const reqion of a.alignment) {
                targets.push({
                    labelAsymId: sele.asym_id,
                    labelSeqRange: {
                        beg: reqion.beg_seq_id,
                        end: reqion.beg_seq_id + reqion.length - 1
                    },
                    matrix: reqion.matrix
                });
            }
            break;
        default: throw new Error('Unsupported option: ' + opt);
    }
    return targets;
};

const toPropsColors = (index: number, a: StructureAlignmentRepresentation): Color[] => {
    const colors: Color[] = [];
    colors.push({
        value: ColorLists['set-1'][index],
        targets: toPropsTargets(a, 'residues')
    });
    return colors;
};

const createMolstarProps = (index: number, a: StructureAlignmentRepresentation, s: SelectionOptions): AlignmentProps => {
    const props: AlignmentProps = {
        kind: 'alignment',
        colors: toPropsColors(index, a)
    };
    if (s !== 'structure') props.targets = toPropsTargets(a, s);
    return props;
};

const createMolstarConfigs = (index: number, a: StructureAlignmentRepresentation, s: SelectionOptions): ConfigsParam => {
    const configs: ConfigsParam = {
        matrix: a.matrix,
        props: createMolstarProps(index, a, s)
    };
    return configs;
};

const createStructureParams = (index: number, a: StructureAlignmentRepresentation, s: SelectionOptions): LoadStructureParams => {
    let p: LoadStructureParams;
    if (isEntry(a.structure)) {
        const s = a.structure as StructureEntry;
        p = [s.entry_id];
    } else {
        const s = a.structure as StructureURL;
        p = [s.url, s.format, s.is_binary];
    }
    p.push(createMolstarConfigs(index, a, s));
    return p;
};

// SEQUENCE

type Position = {
    index: number,
    seq_id?: number,
    code?: string,
    isEQR?: boolean
}

const getMemberIndex = (i: number, j: number) => {
    if (i >= 0 && j === 0) return 0;
    else return i + j;
};

const isAlignmentRegion = (r: AlignmentRegion | AlignmentGap): r is AlignmentRegion => {
    return 'beg_seq_id' in r;
};

const getAlignmentPosition = (p: Position) => {
    return p.index + 1;
};

const toAlignmentBlocks = (positions: Position[]) => {
    const regions: DisplayAlignmentRegion[] = [];
    let startNewBlock = true;
    for (let i = 0; i < positions.length; i++) {
        const p = positions[i];
        if (p.isEQR) {
            if (startNewBlock) {
                regions.push({ begin: getAlignmentPosition(p) });
                startNewBlock = false;
            } else if (i === positions.length - 1) {
                regions[regions.length - 1].end = getAlignmentPosition(p);
            }
        } else if (!p.isEQR && !startNewBlock) {
            regions[regions.length - 1].end = getAlignmentPosition(p) - 1;
            startNewBlock = true;
        }
    }
    if (!regions[regions.length - 1].end)
        regions[regions.length - 1].end = regions[regions.length - 1].begin;
    return regions;
};

/**
 * Structure alignment reqions do not account for gaps in sequence alignmnet. This function adds
 * isEQR annotation to sequence alignmnet that designates structural proximity.
 *
 * @param positions list of sequence alignment positions
 * @param blocks structure alignment reqions
 * @param ind current member index
 */
const annotateEQRs = (positions: Position[], blocks: StructureAlignmentBlock[], ind: number) => {
    const eqrResIds = blocks.flatMap(b => b.regions![ind])
        .flatMap(r => [...Array(r.length).keys()].map(x => x + r.beg_seq_id));
    positions.forEach(p => p.isEQR = !!p.seq_id && eqrResIds.includes(p.seq_id));
};

const toSequence = (positions: Position[], label: string) => {
    return positions.map((p) => {
        return {
            begin: getAlignmentPosition(p),
            value: p.code!,
            oriBegin: p.seq_id,
            source: p.code ? label : undefined,
            sourceId: p.code
        };
    });
};

const annotateOneLetterCodes = (positions: Position[], sequence: string) => {
    positions.map(p => {
        p.code = p.seq_id ? sequence[p.seq_id - 1] : '-';
        return p;
    });
};

const addPositions = (positions: Position[], r: AlignmentRegion | AlignmentGap) => {
    const index = r.beg_index;
    const seq_id = isAlignmentRegion(r) ? r.beg_seq_id : undefined;
    for (let i = 0; i < r.length; i++) {
        const pos = {
            index: index + i,
            seq_id: seq_id ? seq_id + i : undefined
        };
        positions[pos.index] = pos;
    }
};

const toPositions = (regions: AlignmentRegion[], gaps?: AlignmentGap[]) => {
    const positions: Position[] = [];
    regions.forEach(r => addPositions(positions, r));
    gaps && gaps.forEach(g => addPositions(positions, g));
    positions.sort((a, b) => (a.index > b.index) ? 1 : -1);
    return positions;
};

const memebrLabel = async (structure: Structure, data: DataProvider) => {
    const name = isEntry(structure) ? structure.entry_id : structure.name || 'UNK';
    const asym = (structure.selection as StructureInstanceSelection).asym_id;
    const i = await data.polymerInstances([getCombinedInstanceId(name, asym)]);
    const auth = (i.length === 1) ? i[0].auth_asym_id : undefined;
    return `${name} ${createInstanceLabel(asym, auth)}`;
};

const memberColor = (index: number) => {
    const value = ColorLists['set-1'][index];
    return convertHexToRgb(value, 0.45);
};

const createAlignmentTrack = (index: number, alignment: SequenceAlignmentRepresentation): RcsbFvRowConfigInterface => {

    const sequenceDisplay: RcsbFvDisplayConfigInterface = {
        displayType: RcsbFvDisplayTypes.SEQUENCE,
        displayColor: '#000000',
        displayData: alignment.sequence
    };

    const alignmentDisplay: RcsbFvDisplayConfigInterface = {
        displayType: RcsbFvDisplayTypes.BLOCK,
        displayColor: alignment.color,
        displayId: 'alignmentBlock',
        displayData: alignment.alignment,
        includeTooltip: false
    };

    const config: RcsbFvRowConfigInterface = {
        trackId: 'sequence-' + index,
        displayType: RcsbFvDisplayTypes.COMPOSITE,
        trackColor: '#F9F9F9',
        displayColor: '#000000',
        rowTitle: alignment.label,
        titleFlagColor: alignment.color,
        displayConfig: [alignmentDisplay, sequenceDisplay]
    };
    return config;
};

const createRowConfig = (alignments: SequenceAlignmentRepresentation[]) => {
    const tracks: RcsbFvRowConfigInterface[] = [];
    for (let i = 0; i < alignments.length; i ++) {
        tracks.push(createAlignmentTrack(i, alignments[i]));
    }
    return tracks;
};

const createBoardConfig = (size: number) => {
    return {
        trackWidth: 1000,
        range: {
            min: 1,
            max: size
        },
        rowTitleWidth: 100,
        includeAxis: true
    };
};

const createSequenceParams = (index: number, alignments: SequenceAlignmentRepresentation[]) => {
    return {
        elementId: 'pfv-' + index,
        boardConfigData: createBoardConfig(alignments[0].sequence.length),
        rowConfigData: createRowConfig(alignments)
    };
};