import {
    PairwiseStructureAlignment,
    JCE,
    JCEParameters,
    JCECP,
    JCECPParameters,
    JFATCATFlexible,
    JFATCATFlexibleParameters,
    JFATCATRigid,
    JFATCATRigidParameters,
    TMAlign,
    SmithWaterman3D,
    SmithWatermanParameters,
    StructureEntry,
    StructureInstanceSelection,
    StructureWebLink,
    StructureFileUpload,
    StructureFileFormat,
    StructureAlignmentQuery,
    AlignmentQueryOptions
} from '../auto/alignment/alignment-request';
import { StructureActions, applyToStructure } from './helper';
import { isValidEntryId } from './identifier';

export type Structure = StructureEntry | StructureFileUpload | StructureWebLink;
export type Method = PairwiseStructureAlignment['method'];
export type MethodName = Method['name']

export type ParametrizedMethod = Exclude<Method, TMAlign>
export type Parameters = Exclude<ParametrizedMethod['parameters'], undefined>;

type KeysOfUnion<T> = T extends T ? keyof T: never;
export type ParametersKeys = KeysOfUnion<Parameters>;

const defaultFileFormat: StructureFileFormat = 'mmcif';
const defaultMethod: MethodName = 'tm-align';

class TMAlignImpl implements TMAlign {
    name: TMAlign['name'] = 'tm-align';
}

class JFATCATRigidParametersImpl implements JFATCATRigidParameters {
    rmsd_cutoff: number;
    afp_dist_cutoff: number;
    fragment_length: number;
    constructor(data?: JFATCATRigidParameters) {
        this.rmsd_cutoff = data?.rmsd_cutoff || 3;
        this.afp_dist_cutoff = data?.afp_dist_cutoff || 1600;
        this.fragment_length = data?.fragment_length || 8;
    }
}

class JFATCATRigidImpl implements JFATCATRigid {
    name: JFATCATRigid['name'] = 'fatcat-rigid';
    parameters: JFATCATRigidParameters;
    constructor(data?: JFATCATRigid) {
        this.parameters = new JFATCATRigidParametersImpl(data?.parameters);
    }
}

class JFATCATFlexibleParametersImpl implements JFATCATFlexibleParameters {
    rmsd_cutoff: number;
    afp_dist_cutoff: number;
    fragment_length: number;
    max_num_twists: number;
    constructor(data?: JFATCATFlexibleParameters) {
        this.rmsd_cutoff = data?.rmsd_cutoff || 3;
        this.afp_dist_cutoff = data?.afp_dist_cutoff || 1600;
        this.fragment_length = data?.fragment_length || 8;
        this.max_num_twists = data?.max_num_twists || 5;
    }
}

class JFATCATFlexibleImpl implements JFATCATFlexible {
    name: JFATCATFlexible['name'] = 'fatcat-flexible';
    parameters: JFATCATFlexibleParameters;
    constructor(data?: JFATCATFlexible) {
        this.parameters = new JFATCATFlexibleParametersImpl(data?.parameters);
    }
}

class JCEParametersImpl implements JCEParameters {
    gap_max_size: number;
    gap_opening_penalty: number;
    gap_extension_penalty: number;
    fragment_size: number;
    rmsd_threshold: number;
    max_opt_rmsd: number;
    constructor(data?: JCEParameters) {
        this.gap_max_size = data?.gap_max_size || 30;
        this.gap_opening_penalty = data?.gap_opening_penalty || 5;
        this.gap_extension_penalty = data?.gap_extension_penalty || 0.5;
        this.fragment_size = data?.fragment_size || 8;
        this.rmsd_threshold = data?.rmsd_threshold || 3;
        this.max_opt_rmsd = data?.max_opt_rmsd || 99;
    }
}

class JCEImpl implements JCE {
    name: JCE['name'] = 'ce';
    parameters: JCEParameters;
    constructor(data?: JCE) {
        this.parameters = new JCEParametersImpl(data?.parameters);
    }
}

class JCECPParametersImpl implements JCECPParameters {
    gap_max_size: number;
    gap_opening_penalty: number;
    gap_extension_penalty: number;
    fragment_size: number;
    rmsd_threshold: number;
    max_opt_rmsd: number;
    min_cp_length: number;
    constructor(data?: JCECPParameters) {
        this.gap_max_size = data?.gap_max_size || 30;
        this.gap_opening_penalty = data?.gap_opening_penalty || 5;
        this.gap_extension_penalty = data?.gap_extension_penalty || 0.5;
        this.fragment_size = data?.fragment_size || 8;
        this.rmsd_threshold = data?.rmsd_threshold || 3;
        this.max_opt_rmsd = data?.max_opt_rmsd || 99;
        this.min_cp_length = data?.min_cp_length || 5;
    }
}

class JCECPImpl implements JCECP {
    name: JCECP['name'] = 'ce-cp';
    parameters: JCECPParameters;
    constructor(data?: JCECP) {
        this.parameters = new JCECPParametersImpl(data?.parameters);
    }
}

class SmithWatermanParametersImpl implements SmithWatermanParameters {
    gap_opening_penalty: number;
    gap_extension_penalty: number;
    constructor(data?: SmithWatermanParameters) {
        this.gap_opening_penalty = data?.gap_opening_penalty || 8;
        this.gap_extension_penalty = data?.gap_extension_penalty || 1;
    }
}

class SmithWaterman3DImpl implements SmithWaterman3D {
    name: SmithWaterman3D['name'] = 'smith-waterman-3d';
    parameters?: SmithWatermanParameters;
    constructor(data?: SmithWaterman3D) {
        this.parameters = new SmithWatermanParametersImpl(data?.parameters);
    }
}

class StructureInstanceSelectionImpl implements StructureInstanceSelection {
    asym_id: string;
    beg_seq_id?: number;
    end_seq_id?: number;
    constructor(data?: StructureInstanceSelection) {
        this.asym_id = data?.asym_id || '';
        this.beg_seq_id = data?.beg_seq_id;
        this.end_seq_id = data?.end_seq_id;
    }
}

export class StructureEntryImpl implements StructureEntry {
    entry_id: string;
    selection: StructureInstanceSelection;
    constructor(data?: StructureEntry) {
        this.entry_id = data?.entry_id || '';
        this.selection = new StructureInstanceSelectionImpl(<StructureInstanceSelection> data?.selection);
    }
}

export class StructureFileUploadImpl implements StructureFileUpload {
    format: StructureFileFormat;
    selection: StructureInstanceSelection;
    constructor(data?: StructureFileUpload) {
        this.format = data?.format || defaultFileFormat;
        this.selection = new StructureInstanceSelectionImpl(<StructureInstanceSelection> data?.selection);
    }
}

export class StructureWebLinkImpl implements StructureWebLink {
    url: string;
    format: StructureFileFormat;
    name?: string;
    selection: StructureInstanceSelection;
    constructor(data?: StructureWebLink) {
        this.url = data?.url || '';
        this.format = data?.format || defaultFileFormat;
        this.name = data?.name;
        this.selection = new StructureInstanceSelectionImpl(<StructureInstanceSelection> data?.selection);
    }
}

export class QueryContextImpl implements PairwiseStructureAlignment {
    mode: PairwiseStructureAlignment['mode'];
    method: Method;
    structures: Structure[];
    constructor(data?: PairwiseStructureAlignment) {
        this.mode = data?.mode || 'pairwise';
        this.method = toMethodImpl(<Method> data?.method);
        this.structures = data?.structures?.map(s => toStructureImpl(s))
                        || [new StructureEntryImpl(), new StructureEntryImpl()];
    }
}

export class QueryOptionsImpl implements AlignmentQueryOptions {
    return_sequence_data?;
    constructor(data?: AlignmentQueryOptions) {
        this.return_sequence_data = data?.return_sequence_data || false;
    }
}

export class QueryImpl implements StructureAlignmentQuery {
    options: AlignmentQueryOptions;
    context: PairwiseStructureAlignment;
    constructor(data?: StructureAlignmentQuery) {
        this.options = new QueryOptionsImpl(data?.options);
        this.context = new QueryContextImpl(data?.context);
    }
}

export class QueryRequest {

    query: StructureAlignmentQuery;
    files: File[];
    constructor(data?: {query: StructureAlignmentQuery; files?: File[];}) {
        this.query = new QueryImpl(data?.query);
        this.files = data?.files || [];
    }
    isSubmittable(): boolean {
        for (let i = 0; i < this.query.context.structures.length; i++) {
            if (!this.isValidStructure(this.query.context.structures[i]))
                return false;
        }
        return this.query.context.structures.length >= 2;
    }

    private isValidStructure(data: Structure) {
        const actions: StructureActions<boolean> = [
            (data: StructureEntry) => this.isValidStructureEntry(data),
            (data: StructureWebLink) => this.isValidStructureWebLink(data),
            (data: StructureFileUpload) => this.isValidStructureFileUpload(data)
        ];
        return applyToStructure(data, actions);
    }

    private isValidStructureEntry(data: StructureEntry) {
        const isValidId = !!data.entry_id && isValidEntryId(data.entry_id);
        return isValidId && this.isValidInstanceSelection(<StructureInstanceSelection> data.selection);
    }

    private isValidStructureFileUpload(data: StructureFileUpload) {
        return data.format && this.isValidInstanceSelection(<StructureInstanceSelection> data.selection);
    }

    private isValidStructureWebLink(data: StructureWebLink) {
        return !!data.url
            && !!data.format
            && this.isValidInstanceSelection(<StructureInstanceSelection> data.selection);
    }

    private isValidInstanceSelection(data?: StructureInstanceSelection) {
        if (!data) return false;
        const hasValidId = !!data.asym_id;
        const selectedRangeHasRequiredLength = (!!data.beg_seq_id && !!data.end_seq_id)
            ? data.end_seq_id - data.beg_seq_id > 1
            : true;
        return hasValidId && selectedRangeHasRequiredLength;
    }
}

export function toMethodImpl(data?: Method): Method {
    const methodName: MethodName = data?.name || defaultMethod;
    switch (methodName) {
        case 'tm-align':
            return new TMAlignImpl();
        case 'fatcat-rigid':
            return new JFATCATRigidImpl(<JFATCATRigid> data);
        case 'fatcat-flexible':
            return new JFATCATFlexibleImpl(<JFATCATFlexible> data);
        case 'ce':
            return new JCEImpl(<JCE> data);
        case 'ce-cp':
            return new JCECPImpl(<JCECP> data);
        case 'smith-waterman-3d':
            return new SmithWaterman3DImpl(<SmithWaterman3D> data);
        default:
            throw new Error('Unsupported alignment method: ' + methodName);
    }
}

function toStructureImpl(data: Structure): Structure {
    const actions: StructureActions<Structure> = [
        (data: StructureEntry) => new StructureEntryImpl(data),
        (data: StructureWebLink) => new StructureWebLinkImpl(data),
        (data: StructureFileUpload) => new StructureFileUploadImpl(data)
    ];
    return applyToStructure(data, actions);
}