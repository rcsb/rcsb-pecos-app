import { createAsymLabel } from '../utils/common';
import StructureEntry from "../model/request/structure-entry";
import StructureURL from "../model/response/structure-url";
import AlignmentTypeEnum from "../model/enum/enum-alignment-type";
import DataEventObservable from '../observable/data-observable';

import { triggerDownload, getFormattedTime } from '../utils/downloads';

export const resultsToStatistics = (results, type) => {
    const alignment = results[0];
    return {
        scores: summary(alignment, type).getScores().map(s => s.toObject()),
        length: summary(alignment, type).getNAlnResiduePairs()
      }
}

const summary = (alignment, type) => {
    if (alignment.isFlexible()) {
        if (type.id === AlignmentTypeEnum.FLEXIBLE.id) {
            return alignment.getSummary();
        } else {
            return alignment.getStructureAlignmentBlock(type.blockIndex).getSummary();
        }
    } else {
        return alignment.getSummary();
    }    
}

export const resultsToInfo = async (alignment) => {

    const data = [];
    for (let i=0; i<alignment.getStructures().length; i++) {
        const info = {};
        const s = alignment.getStructure(i);
        if (s instanceof StructureEntry) {
            const instanceId = s.getInstanceId();
            const obj = await DataEventObservable.getInstanceData(instanceId);
            info.id = `${s.getEntryId()}.${createAsymLabel(s.getSelection().getAsymId(), obj.auth_asym_id)}`;
            info.pdbx_description = obj.pdbx_description;
            info.rcsb_sample_sequence_length = obj.rcsb_sample_sequence_length;
        } else if (s instanceof StructureURL) {
            info.id = s.getName();
            const sequence = alignment.getSequenceAlignment()[i].getSequence();
            if (sequence) info.rcsb_sample_sequence_length = sequence.length;
        } else {
            throw new Error('Unsupported structure type');
        }
        info.modeled_length = alignment.getSummary().getNModeledResidues()[i];
        info.coverage = alignment.getSummary().getAlnCoverage()[i]
        data.push(info);
    }
    return data;
}

function getStructureName(s) {
    if (s instanceof StructureEntry) {
        return s.getEntryId();
    } else if (s instanceof StructureURL) {
        return s.getName();
    } else {
        throw new Error('Unsupported structure type');
    }
}

function parseTransformations(structures, block) {
    const transformations = [];
    for (let i = 0; i < structures.length; i++) {
        const s = structures[i];
        const t = {
            id: getStructureName(s),
            selection: s.getSelection(),
            matrix: block.getTransformations()[i]
        };
        transformations.push(t);
    }
    return transformations;
}

function transformsToJSON(results) {
    const transformations = [];
    for (let j=0; j<results.length; j++) {
        const alignment = results[j];
        const structures = alignment.getStructures();
        const blocks = alignment.getStructureAlignment();
        for (let i=0; i<blocks.length; i++) {
            transformations.push({
                block_id: i + 1,
                transformations: parseTransformations(structures, blocks[i])
            })
        }
    }

    return JSON.stringify(transformations);
}

export async function exportMatricesAsJSON(results) {
    const filename = `transformation_matrices_${getFormattedTime()}.json`;
    const data = transformsToJSON(results);
    triggerDownload(data, filename);
}