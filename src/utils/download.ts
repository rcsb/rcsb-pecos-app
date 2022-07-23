/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
    Alignment,
    AlignmentGap,
    AlignmentRegion,
    StructureAlignmentBlock,
    StructureEntry,
    StructureInstanceSelection,
    StructureURL
} from '../auto/alignment/alignment-response';
import { isEntry } from './helper';
import { getCombinedInstanceId } from './identifier';

/* eslint-disable @typescript-eslint/no-explicit-any */
function formattedTime() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const h = today.getHours();
    const mi = today.getMinutes();
    const s = today.getSeconds();
    return y + '-' + m + '-' + d + '-' + h + '-' + mi + '-' + s;
}

function openUrl(url: string) {
    const opened = window.open(url, '_blank');
    if (!opened) {
        window.location.href = url;
    }
}

function click(node: HTMLAnchorElement) {
    try {
        node.dispatchEvent(new MouseEvent('click'));
    } catch (e) {
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);
        node.dispatchEvent(evt);
    }
}

function download(data: Blob | string, downloadName = 'download') {
    // using ideas from https://github.com/eligrey/FileSaver.js/blob/master/FileSaver.js

    if (!data) return;

    if ('download' in HTMLAnchorElement.prototype) {
        const a = document.createElement('a');
        a.download = downloadName;
        a.rel = 'noopener';

        if (typeof data === 'string') {
            a.href = data;
            click(a);
        } else {
            a.href = URL.createObjectURL(data);
            setTimeout(() => URL.revokeObjectURL(a.href), 4E4); // 40s
            setTimeout(() => click(a));
        }
    } else if (typeof navigator !== 'undefined' && (navigator as any).msSaveOrOpenBlob) {
        // native saveAs in IE 10+
        (navigator as any).msSaveOrOpenBlob(data, downloadName);
    } else {
        const ua = window.navigator.userAgent;
        const isSafari = /Safari/i.test(ua);
        const isChromeIos = /CriOS\/[\d]+/.test(ua);

        const open = (str: string) => {
            openUrl(isChromeIos ? str : str.replace(/^data:[^;]*;/, 'data:attachment/file;'));
        };

        if ((isSafari || isChromeIos) && FileReader) {
            if (data instanceof Blob) {
                // no downloading of blob urls in Safari
                const reader = new FileReader();
                reader.onloadend = () => open(reader.result as string);
                reader.readAsDataURL(data);
            } else {
                open(data);
            }
        } else {
            const url = URL.createObjectURL(typeof data === 'string' ? new Blob([data]) : data);
            location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 4E4); // 40s
        }
    }
}

function parseTransforms(structures: (StructureEntry | StructureURL)[], block: StructureAlignmentBlock) {
    const transformations = [];
    for (let i = 0; i < structures.length; i++) {
        const s = structures[i];
        const t = {
            id: isEntry(s) ? s.entry_id : s.name,
            selection: s.selection,
            matrix: block.transformations[i]
        };
        transformations.push(t);
    }
    return transformations;
}

function transformsToJSON(results: Alignment[]) {
    const transformations = [];
    for (let j = 0; j < results.length; j++) {
        const alignment = results[j];
        const structures = alignment.structures;
        const blocks = alignment.structure_alignment;
        for (let i = 0; i < blocks.length; i++) {
            transformations.push({
                block_id: i + 1,
                transformations: parseTransforms(structures, blocks[i])
            });
        }
    }

    return JSON.stringify(transformations);
}

export async function exportTransformations(results?: Alignment[]) {
    if (!results) return;
    const filename = `transformation_matrices_${formattedTime()}.json`;
    const data = transformsToJSON(results);
    const blob = new Blob([data], { type: 'text/plain' });
    download(blob, filename);
}

function header(structure: StructureEntry | StructureURL) {
    const name = isEntry(structure) ? structure.entry_id : structure.name || 'N/A';
    const asym = (structure.selection as StructureInstanceSelection).asym_id;
    return `>${getCombinedInstanceId(name, asym)}`;
}

type Position = {
    index: number,
    asym_id?: string,
    seq_id?: number,
    code?: string
}

const toPositions = (regions?: AlignmentRegion[], gaps?: AlignmentGap[]) => {
    const positions: Position[] = [];
    regions && regions.map(r => addPositions(positions, r));
    gaps && gaps.map(g => addPositions(positions, g));
    positions.sort((a, b) => (a.index > b.index) ? 1 : -1);
    return positions;
};

function isAAPosition(p: AlignmentRegion | AlignmentGap): p is AlignmentRegion {
    return 'beg_seq_id' in p;
}

const addPositions = (positions: Position[], r: AlignmentRegion | AlignmentGap) => {
    for (let i = 0; i < r.length; i++) {
        const pos = {
            index: r.beg_index + i,
            asym_id: isAAPosition(r) ? r.asym_id + i : undefined,
            seq_id: isAAPosition(r) ? r.beg_seq_id + i : undefined
        };
        positions[pos.index] = pos;
    }
};

const addAminoacidCodes = (positions: Position[], sequence?: string) => {
    if (!sequence) return;
    positions.map(p => {
        p.code = (p.seq_id) ? sequence[p.seq_id - 1] : '-';
        return p;
    });
};

async function alignmentsToFASTA(results: Alignment[]) {
    const data = [];
    const multipleEntries = results.length > 1;
    for (let j = 0; j < results.length; j++) {
        const alignment = results[j];
        const size = alignment.sequence_alignment!.length;
        (multipleEntries) && data.push((j + 1).toString());
        for (let i = 0; i < size; i++) {
            data.push(header(alignment.structures[i]));
            const sequence = alignment.sequence_alignment![i].sequence;
            const gaps = alignment.sequence_alignment![i].gaps;
            const regions = alignment.sequence_alignment![i].regions;
            const positions = toPositions(regions, gaps);
            addAminoacidCodes(positions, sequence);
            const seq_alignment = positions.map(p => p.code).join('');
            data.push(seq_alignment);
        }
    }
    return data.join('\n');
}

export async function exportSequenceAlignment(results?: Alignment[]) {
    if (!results) return;
    const filename = `sequence_alignment_${formattedTime()}.fasta`;
    const data = await alignmentsToFASTA(results);
    const blob = new Blob([data], { type: 'text/plain' });
    download(blob, filename);
}