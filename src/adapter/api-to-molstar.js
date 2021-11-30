import StructureEntry from '../model/request/structure-entry';
import EntryPreset from '../model/molstar/preset-entry';
import FilePreset from '../model/molstar/preset-file';
import ViewOptionsEnum from '../model/enum/enum-view-options';
import AlignmentTypeEnum from '../model/enum/enum-alignment-type';

import { colorPalette } from '../utils/constants';

export const resultsToMolstarPresets = (results, view, type) => {

    const presets = [];

    const reference = results[0].getStructure(0);
    const referencePreset = init(reference);
    const transformed = transformBlocks(reference, results[0].getStructureAlignment(), 0);
    toPresetSelection(referencePreset, view, type, transformed);
    presets.push(referencePreset);

    for (let j=0; j < results.length; j++) {
        const alignment = results[j];
        for (let i=0; i < alignment.structuresNum(); i++) {
            const structure = alignment.getStructure(i);
            const transformed = transformBlocks(structure, alignment.getStructureAlignment(), i);
            if (i > 0) {
                const preset = init(structure);
                const color = colorPalette[i];
                toPresetSelection(preset, view, type, transformed);
                toPresetRepresentation(preset, color, type, transformed);
                presets.push(preset);
            } else if (i === 0) {
                toPresetRepresentation(referencePreset, colorPalette[0], type, transformed);
            }
        }
    }
    return presets;
}

const init = (structure) => {
    let preset;
    if (structure instanceof StructureEntry) {
        preset = new EntryPreset();
        preset.setPdbId(structure.getEntryId());
    } else {
        preset = new FilePreset();
        preset.setURL(structure.getURL());
        preset.setFormat(structure.getFormat());
        preset.setIsBinary(structure.isBinary());
    }
    return preset;
}

const toPresetSelection = (preset, view, type, data) => {
    if (type.id === AlignmentTypeEnum.RIGID.id) {
        toSelection(preset, view, data[type.blockIndex]);
    } else if (type.id === AlignmentTypeEnum.FLEXIBLE.id) {
        data.map(d => toSelection(preset, view, d));
    } else {
        throw new Error('Unsupported alignment type [ '+JSON.stringify(type)+' ]');
    }
}

const toSelection = (preset, view, data) => {
    const asym = data.asym;
    const matrix = data.transformation;
    if (view.id === ViewOptionsEnum.STRUCTURES.id) {
        preset.setMatrix(matrix);
    } else if (view.id === ViewOptionsEnum.POLYMER_CHAINS.id) {
        preset.getProps().addSelection(matrix, asym);
    } else if (view.id === ViewOptionsEnum.RESIDUES.id) {
        data.regions.map(r => {
            const beg = r.getBegSeqId();
            const end = beg+r.getLength()-1;
            preset.getProps().addSelection(matrix, asym, beg, end);
        });
    } else {
        throw new Error('Unsupported view option [ '+JSON.stringify(view)+' ]');
    }
}

const toPresetRepresentation = (preset, color, type, data) => {
    const eqrs = toEQR(type, data);
    eqrs.map(range => {
        const asym = range.getAsymId();
        const beg = range.getBegSeqId();
        const end = beg+range.getLength()-1;
        preset.getProps().addRepresentation(color, asym, beg, end);
    });
}

const transformBlocks = (structure, blocks, memberIdx) => {
    const transformed = [];
    for (let i=0; i<blocks.length; i++) {
        transformed.push({
            asym: structure.getSelection().getAsymId(),
            regions: blocks[i].getRegions()[memberIdx],
            transformation: blocks[i].getTransformations()[memberIdx]
        });
    }
    return transformed;
} 

const toEQR = (type, data) => {

    if (type.id === AlignmentTypeEnum.RIGID.id) {
        return data[type.blockIndex].regions;
    } else if (type.id === AlignmentTypeEnum.FLEXIBLE.id) {
        const regions = [];
            data.map(d => regions.push(...d.regions));
            return regions;
    } else {
        throw new Error('Unsupported alignment type [ '+JSON.stringify(type)+' ]');
    }
}