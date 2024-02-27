import {
    Alignment,
    StructureEntry,
    StructureInstanceSelection
} from '../auto/alignment/alignment-response';

const rePdbId = /^[1-9][A-Z0-9][A-Z0-9][A-Z0-9]$/i;
const reModelId = /^[A-Z0-9]+_[A-Z0-9]{6,}$/i;
const reUniprotId = /^[OPQ][0-9][A-Z0-9]{3}[0-9]|[A-NR-Z][0-9]([A-Z][A-Z0-9]{2}[0-9]){1,2}$/i;

export function isValidEntryId(value: string) {
    return isValidPdbId(value) || isValidModelId(value);
}

function isValidPdbId(pdbId: string) {
    return pdbId.length === 4 && rePdbId.test(pdbId);
}

function isValidModelId(modelId: string) {
    return reModelId.test(modelId);
}

export function isValidUniprotId(modelId: string) {
    return reUniprotId.test(modelId);
}

export function isValidMgnifyId(modelId: string) {
    return modelId.startsWith('MGYP') && modelId.length === 16;
}

/**
 * Uses RCSB PDB convention to create a string representation of instance
 * identifier from parts: entry ID and asym ID. For example, 4HHB.A
 *
 * @param entryId entry ID
 * @param asymId asym ID
 * @returns string representation of instance identifier
 */
export function getCombinedInstanceId(entryId: string, asymId: string) {
    return `${entryId}.${asymId}`;
}

export function getCombinedInstanceIds(results?: Alignment[]) {
    const ids: string[] = [];
    if (!results) return ids;
    for (const a of results) {
        a.structures.forEach(s => {
            if ('entry_id' in s) {
                const structure = s as StructureEntry;
                const sele = structure.selection as StructureInstanceSelection;
                const id = getCombinedInstanceId(structure.entry_id, sele.asym_id);
                if (!ids.includes(id)) ids.push(id);
            }
        });
    }
    return ids;
}

/**
 * Creates an instance label in one of the formats:
 * - @param asymId if label and auth IDs are the same
 * - @param asymId [@param authAsymId] if label and auth IDs are the different
 *
 * @param asymId system assigned chain ID (_label_asym_id)
 * @param authAsymId author assigned chain ID (_auth_asym_id)
 * @returns label
 */
export function createInstanceLabel(asymId: string, authAsymId?: string) {
    if (!authAsymId) return asymId;
    return (!authAsymId || asymId === authAsymId) ? asymId : `${asymId} [auth ${authAsymId}]`;
}