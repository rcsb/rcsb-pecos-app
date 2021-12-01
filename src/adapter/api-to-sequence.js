import { colorPalette } from '../utils/constants';
import { hexToStyle } from '../utils/common';

import DataEventObservable from '../observable/data-observable';
import AlignmentTypeEnum from '../model/enum/enum-alignment-type';

import StructureEntry from '../model/request/structure-entry';
import StructureURL from '../model/response/structure-url';
import AlignmentRegion from '../model/response/region';

import { triggerDownload, getFormattedTime } from '../utils/downloads';

export const resultsToSequence = async (alignment, type) => {
    const rows = [];
    const alignmentSize = alignment.getSequenceAlignment().length;
    for (let i = 0; i < alignmentSize; i++) {
        const sequence = await getSequence(alignment, i);
        const gaps = alignment.getSequenceAlignment()[i].getGaps();
        const regions = alignment.getSequenceAlignment()[i].getRegions();
        const lookup = representationLookup(alignment, i, type);
        rows.push(toMarkupPositions(sequence, regions, gaps, lookup));
    }
    return toBlocks(rows);
};

const toBlocks = (sequences) => {
    let i, j;
    const rows = [];
    const chunk = 50;
    const alnLen = sequences[0].length;
    const seqLen = sequences.length;
    for (i = 0, j = alnLen; i < j; i += chunk) {
        for (let k = 0; k < seqLen; k++) {
            addRows(rows, sequences[k].slice(i, i + chunk));
        }
    }
    return rows;
};

const addRows = (rows, list) => {
    const row = [];
    row[0] = asFirst(list);
    row[1] = asMarkup(list).join('');
    row[2] = asLast(list);
    rows.push(row);
};

function getFirstLabel(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].code !== '-') return arr[i].seq_id;
    }
    return '';
}

function asFirst(arr) {
    return "<div class='res-num-beg'>" + getFirstLabel(arr) + '</div>';
}

function getLastLabel(arr) {
    for (let i = arr.length - 1; i >= 0; i--) {
        if (arr[i].code !== '-') return arr[i].seq_id;
    }
    return '';
}

function asLast(arr) {
    return "<div class='res-num-end'>" + getLastLabel(arr) + '</div>';
}

const getSequence = async (alignment, i) => {
    const a = alignment.getSequenceAlignment()[i];
    if (a.getSequence()) return a.getSequence();
    else {
        const instanceId = alignment.getStructure(i).getInstanceId();
        return await DataEventObservable.getInstanceSequence(instanceId);
    }
};

const toMarkupPositions = (sequence, regions, gaps, lookup) => {
    const positions = toPositions(regions, gaps);
    addAminoacidCodes(positions, sequence);
    addAlignmentMarkup(positions, lookup);
    return positions;
};

const toPositions = (regions, gaps) => {
    const positions = [];
    regions.map(r => addPositions(positions, r.getAsymId(), r));
    gaps && gaps.map(g => addPositions(positions, undefined, g));
    positions.sort((a, b) => (a.index > b.index) ? 1 : -1);
    return positions;
};

const addPositions = (positions, asym, r) => {
    const index = r.getBegIndex();
    const seq_id = (r instanceof AlignmentRegion) ? r.getBegSeqId() : undefined;
    for (let i = 0; i < r.getLength(); i++) {
        const pos = {
            asym_id: asym,
            index: index + i,
            seq_id: (seq_id) ? seq_id + i : undefined
        };
        positions[pos.index] = pos;
    }
};

const addAminoacidCodes = (positions, sequence) => {
    positions.map(p => {
        p.code = (p.seq_id) ? sequence[p.seq_id - 1] : '-';
        return p;
    });
};

const addAlignmentMarkup = (positions, lookup) => {
    return positions.map((p) => {
        if (p.code !== '-') {
            const key = residueKey(p);
            p.markup = lookup.has(key) ? colorMarkup(lookup.get(key)) : '';
        }
    });
};

function asMarkup(positions) {
    const data = positions.map((p) => wrappResidueElement(p));
    return data;
}

function residueElement(p) {
    if (p.code !== '-') {
        return `<div ${p.markup} class="elmnt-seq elmnt-res">${p.code}</div>`;
    } else {
        return `<div class="elmnt-seq">${p.code}</div>`;
    }
}

function wrappResidueElement(p) {
    if (p.code !== '-') {
        return `<span data-tooltip="${p.asym_id}:${p.seq_id}" data-flow="right">${residueElement(p)}</span>`;
    } else {
        return `<span>${residueElement(p)}</span>`;
    }
}

function residueKey(residue) {
    return `${residue.asym_id}-${residue.seq_id}`;
}

function colorMarkup(value) {
    const color = hexToStyle(value, 0.45);
    return `style='background-color: ${color};'`;
}

const representationLookup = (alignment, i, type) => {
    const regions = getRegions(alignment, i, type);
    const positions = toPositions(regions, null).filter(p => p);
    return createColorLookup(positions, i);
};

const getRegions = (alignment, i, type) => {
    if (type.id === AlignmentTypeEnum.RIGID.id) {
        return alignment.getStructureAlignment()[type.blockIndex].getRegions()[i];
    } else if (type.id === AlignmentTypeEnum.FLEXIBLE.id) {
        const regions = [];
        alignment.getStructureAlignment().map(b => regions.push(...b.getRegions()[i]));
        return regions;
    } else {
        throw new Error('Unsupported alignment type [ ' + JSON.stringify(type) + ' ]');
    }
};

function createColorLookup(positions, index) {
    const map = new Map();
    for (const v of positions) {
        const key = residueKey(v);
        map.set(key, colorPalette[index]);
    }
    return map;
}

function createFASTAHeader(structure) {
    let name;
    const labelId = structure.getSelection().getAsymId();
    if (structure instanceof StructureEntry) {
        name = structure.getEntryId();
    } else if (structure instanceof StructureURL) {
        name = structure.getName();
    } else {
        throw new Error('Unsupported structure type');
    }
    return `>${name}.${labelId}`;
}

async function alignmentsToFASTA(results) {
    const data = [];
    const multipleEntries = results.length > 1;
    for (let j = 0; j < results.length; j++) {
        const alignment = results[j];
        const size = alignment.getSequenceAlignment().length;
        (multipleEntries) && data.push((j + 1).toString());
        for (let i = 0; i < size; i++) {
            const s = alignment.getStructure(i);
            data.push(createFASTAHeader(s));
            const sequence = await getSequence(alignment, i);
            const gaps = alignment.getSequenceAlignment()[i].getGaps();
            const regions = alignment.getSequenceAlignment()[i].getRegions();
            const positions = toPositions(regions, gaps);
            addAminoacidCodes(positions, sequence);
            const seq_alignment = positions.map(p => p.code).join('');
            data.push(seq_alignment);
        }
    }
    return data.join('\n');
}

export async function exportAlignmentAsFASTA(results) {
    const filename = `sequence_alignment_${getFormattedTime()}.fasta`;
    const fasta = await alignmentsToFASTA(results);
    triggerDownload(fasta, filename);
}
