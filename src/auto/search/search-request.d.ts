/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type ResultsContentType = ('experimental' | 'computational')[];
/**
 * Controls the additional metadata returned with search results such as scores returned by individual services and context of the match, e.g. alignments from sequence search service
 */
export type RequestOptionsResultsVerbosity = 'compact' | 'minimal' | 'verbose';
export type NumericValue = number;
export type DateValue = string;
/**
 * Allows obtaining the aggregations relevant to the search query. When absent, aggregations are not returned. Multi-dimensional aggregations are allowed.
 */
export type RequestOptionsFacets = (
    | TermsFacet
    | HistogramFacet
    | DateHistogramFacet
    | RangeFacet
    | DateRangeFacet
    | CardinalityFacet
    | FilterFacet
)[];
/**
 * Search results are ordered by the relevancy scores by default, from the most relevant matches to the least relevant matches (higher score to lower score).
 */
export type RelevanceScoreRankingOption = 'score';
/**
 * The order in which to sort. Defaults to “desc”.
 */
export type SortDirection = 'asc' | 'desc';
/**
 * Sort options supported for results returned as groups
 */
export type SortOptionGroupsSortBy = 'size' | 'count';
/**
 * Specifies the type of the returned identifiers.
 */
export type ReturnType =
    | 'entry'
    | 'polymer_entity'
    | 'non_polymer_entity'
    | 'polymer_instance'
    | 'assembly'
    | 'mol_definition';

/**
 * Provides a generic interface to represent the RCSB Search API query language.
 */
export interface SearchQuery {
    request_info?: RequestInfo;
    request_options?: RequestOptions;
    return_type: ReturnType;
    /**
     * Any valid query string as per the Search Aggregator query syntax is permitted. A search consists of one or more groups combined.
     */
    query?: GroupNode | TerminalNode;
}
/**
 * Information about the query.
 */
export interface RequestInfo {
    /**
     * The ID of a query is globally unique and unambiguously identifies a query.
     */
    query_id?: string;
    /**
     * The origin of the query: <br /> - 'mypdb' indicates that the query was run by the MyPDB service that allows users to have searches run periodically and have the results emailed to them; <br /> - 'system' indicates programmatic access.
     */
    src?: 'ui' | 'mypdb_service' | 'mypdb_user' | 'rcsb_test';
}
export interface RequestOptions {
    results_content_type?: ResultsContentType;
    results_verbosity?: RequestOptionsResultsVerbosity;
    facets?: RequestOptionsFacets;
    /**
     * Allows partitioning search results into groups
     */
    group_by?: GroupByDepositID | GroupBySequenceIdentity | GroupByUniProtAccession;
    /**
     * Determines the representation of grouped data: 'groups' - search results are divided into groups and each group is returned with all associated search hits; 'representatives' - only a single search hit is returned per group
     */
    group_by_return_type?: 'groups' | 'representatives';
    sort?: (SortOptionAttributes | SortOptionGroups)[];
    paginate?: RequestOptionsPaginate;
    /**
     * Scoring algorithm to be used for scores calculation of the final result set
     */
    scoring_strategy?:
    | 'combined'
    | 'sequence'
    | 'seqmotif'
    | 'strucmotif'
    | 'structure'
    | 'chemical'
    | 'text'
    | 'text_chem'
    | 'full_text';
    /**
     * When set to true, all search matches are returned. It cannot be used together with pagination or return count parameters
     */
    return_all_hits?: boolean;
    /**
     * Allows obtaining the counts only instead of identifiers. When undefined, search result identifiers are returned
     */
    return_counts?: boolean;
    /**
     * When enabled, the search results are return with profiling information, e.g. execution timings
     */
    return_explain_metadata?: boolean;
}
/**
 * This aggregation dynamically builds buckets - one per unique value
 */
export interface TermsFacet {
    /**
     * Specifies the name of the aggregation
     */
    name: string;
    /**
     * Specifies the type of the aggregation
     */
    aggregation_type: 'terms';
    /**
     * Specifies the full attribute name to aggregate on
     */
    attribute: string;
    /**
     * Minimum number of items in the bin required for the bin to be returned
     */
    min_interval_population?: number;
    /**
     * Maximum number of intervals to return for a given facet
     */
    max_num_intervals?: number;
    facets?: RequestOptionsFacets;
}
/**
 * This aggregation dynamically builds fixed size (a.k.a. interval) buckets over the values. Can only be used with numeric values
 */
export interface HistogramFacet {
    /**
     * Specifies the name of the aggregation
     */
    name: string;
    /**
     * Specifies the type of the aggregation
     */
    aggregation_type: 'histogram';
    /**
     * Specifies the full attribute name to aggregate on
     */
    attribute: string;
    /**
     * Size of the intervals into which a given set of values is divided
     */
    interval: number | number;
    /**
     * Minimum number of items in the bin required for the bin to be returned.
     */
    min_interval_population?: number;
    facets?: RequestOptionsFacets;
}
/**
 * This aggregation dynamically builds fixed size (a.k.a. interval) buckets over the values. Can only be used with date values
 */
export interface DateHistogramFacet {
    /**
     * Specifies the name of the aggregation
     */
    name: string;
    /**
     * Specifies the type of the aggregation
     */
    aggregation_type: 'date_histogram';
    /**
     * Specifies the full attribute name to aggregate on
     */
    attribute: string;
    /**
     * Size of the intervals into which a given set of values is divided
     */
    interval: 'year';
    /**
     * Minimum number of items in the bin required for the bin to be returned.
     */
    min_interval_population?: number;
    facets?: RequestOptionsFacets;
}
/**
 * This aggregation enables to define a set of ranges - each representing a bucket. Dedicated for numeric values
 */
export interface RangeFacet {
    /**
     * Specifies the name of the aggregation
     */
    name: string;
    /**
     * Specifies the type of the aggregation
     */
    aggregation_type: 'range';
    /**
     * Specifies the full attribute name to aggregate on
     */
    attribute: string;
    /**
     * A set of ranges, each representing a bucket. Note that this aggregation includes the 'from' value and excludes the 'to' value for each range
     */
    ranges: {
        from?: NumericValue;
        to?: NumericValue;
        [k: string]: unknown;
    }[];
    facets?: RequestOptionsFacets;
}
/**
 * This aggregation enables to define a set of ranges - each representing a bucket. Dedicated for date values with an ability to express 'from' and 'to' values as date math expression
 */
export interface DateRangeFacet {
    /**
     * Specifies the name of the aggregation
     */
    name: string;
    /**
     * Specifies the type of the aggregation
     */
    aggregation_type: 'date_range';
    /**
     * Specifies the full attribute name to aggregate on
     */
    attribute: string;
    /**
     * A set of ranges, each representing a bucket. Note that this aggregation includes the 'from' value and excludes the 'to' value for each range.
     */
    ranges: {
        from?: DateValue;
        to?: DateValue;
    }[];
    facets?: RequestOptionsFacets;
}
/**
 * A single-value metrics aggregation that calculates an approximate count of distinct values
 */
export interface CardinalityFacet {
    /**
     * Specifies the name of the aggregation
     */
    name: string;
    /**
     * Specifies the type of the aggregation
     */
    aggregation_type: 'cardinality';
    /**
     * Specifies the full attribute name to aggregate on
     */
    attribute: string;
    /**
     * Allows to trade memory for accuracy, and defines a unique count below which counts are expected to be close to accurate
     */
    precision_threshold?: number;
}
/**
 * A single bucket aggregation that narrows the set of documents to those that match a filter query
 */
export interface FilterFacet {
    filter: FilterQueryGroupNode | FilterQueryTerminalNode;
    facets: RequestOptionsFacets;
}
export interface FilterQueryGroupNode {
    /**
     * The type of the node.
     */
    type: 'group';
    /**
     * Boolean operator connects and defines the relationship between the child nodes.
     */
    logical_operator: 'or' | 'and';
    nodes: (FilterQueryTerminalNode | FilterQueryGroupNode)[];
}
/**
 * A terminal node is an atomic-level element within a query.
 */
export interface FilterQueryTerminalNode {
    /**
     * The type of the node.
     */
    type: 'terminal';
    parameters: {
        /**
         * The search term(s). Can be a single or multiple words, numbers, dates, date math expressions, or ranges.
         */
        value?: string | number | boolean | Range | DateRange | (string | number | number)[];
        /**
         * The search field. Must exist in the current schema.
         */
        attribute: string;
        /**
         * Indicates if the operator is negated.
         */
        negation?: boolean;
        /**
         * The operator allows specifying the evaluation expression.
         */
        operator:
        | 'equals'
        | 'greater'
        | 'greater_or_equal'
        | 'less'
        | 'less_or_equal'
        | 'range'
        | 'exact_match'
        | 'in'
        | 'exists';
        /**
         * Allows case sensitive matching of the value with the indexed attribute values when set to true. Default is false which means the case insensitivity of matching.
         */
        case_sensitive?: boolean;
    };
    [k: string]: unknown;
}
export interface Range {
    from?: NumericValue;
    /**
     * Indicated an inclusive lower bound.
     */
    include_lower?: boolean;
    to?: NumericValue;
    /**
     * Indicated an inclusive upper bound.
     */
    include_upper?: boolean;
}
export interface DateRange {
    from?: DateValue;
    /**
     * Indicated an inclusive lower bound.
     */
    include_lower?: boolean;
    to?: DateValue;
    /**
     * Indicated an inclusive upper bound.
     */
    include_upper?: boolean;
}
export interface GroupByDepositID {
    /**
     * The method used to group search hits on the basis of common identifier for a group of entries deposited as a collection
     */
    aggregation_method: 'matching_deposit_group_id';
    ranking_criteria_type?: SortOptionAttributes;
}
export interface SortOptionAttributes {
    sort_by: RelevanceScoreRankingOption | string;
    filter?: FilterQueryGroupNode | FilterQueryTerminalNode;
    direction?: SortDirection;
}
export interface GroupBySequenceIdentity {
    /**
     * The method used to group search hits on the basis of protein sequence clusters that meet a predefined identity threshold
     */
    aggregation_method: 'sequence_identity';
    similarity_cutoff: 100 | 95 | 90 | 70 | 50 | 30;
    ranking_criteria_type?: SortOptionAttributes;
}
export interface GroupByUniProtAccession {
    /**
     * The method used to group search hits on the basis of common UniProt accession
     */
    aggregation_method: 'matching_uniprot_accession';
    /**
     * Predefined set of criteria used to determine group members ranking
     */
    ranking_criteria_type?: SortOptionAttributes | UniprotAccessionGroupRankingOption;
}
export interface UniprotAccessionGroupRankingOption {
    sort_by: 'coverage';
}
export interface SortOptionGroups {
    sort_by: RelevanceScoreRankingOption | SortOptionGroupsSortBy;
    direction?: SortDirection;
}
/**
 * Pagination allows returning only a portion, rather than the whole, result set. By default, only top 10 search matches
 */
export interface RequestOptionsPaginate {
    /**
     * Specifies how many matches should be skipped from the top of the search results
     */
    start?: number;
    /**
     * Number of matched returned in the result set
     */
    rows?: number;
}
export interface GroupNode {
    /**
     * The type of the node.
     */
    type: 'group';
    /**
     * Boolean operator connects and defines the relationship between the child nodes.
     */
    logical_operator: 'or' | 'and';
    nodes: (TerminalNode | GroupNode)[];
    /**
     * A textual description of what the node represents.
     */
    label?: string;
}
/**
 * A terminal node is an atomic-level element within a query.
 */
export interface TerminalNode {
    /**
     * The type of the node.
     */
    type: 'terminal';
    /**
     * An ID that is unique within the enclosing query.
     */
    node_id?: number;
    /**
     * The search service that is responsible for running the query and retrieving the search results.
     */
    service: 'full_text' | 'text' | 'text_chem' | 'sequence' | 'structure' | 'chemical' | 'seqmotif' | 'strucmotif';
    /**
     * Search parameters. Parameters are specific to the search service.
     */
    parameters?:
    | FullTextQueryParameters
    | AttributeTextQueryParameters
    | SequenceQueryParameters
    | StructureQueryParameters
    | ChemicalQueryFormulaParameters
    | ChemicalQueryDescriptorParameters
    | SeqmotifQueryParameters
    | StrucmotifQueryParameters;
    /**
     * A textual description of what the node represents.
     */
    label?: string;
}
export interface FullTextQueryParameters {
    /**
     * The search term(s).
     */
    value: string;
}
export interface AttributeTextQueryParameters {
    /**
     * The search term(s). Can be a single or multiple words, numbers, dates, date math expressions, or ranges.
     */
    value?: string | number | boolean | Range | DateRange | (string | number | number)[];
    /**
     * The search field. Must exist in the current schema.
     */
    attribute: string;
    /**
     * Indicates if the operator is negated.
     */
    negation?: boolean;
    /**
     * The operator allows specifying the evaluation expression.
     */
    operator:
    | 'equals'
    | 'greater'
    | 'greater_or_equal'
    | 'less'
    | 'less_or_equal'
    | 'range'
    | 'contains_words'
    | 'contains_phrase'
    | 'exact_match'
    | 'in'
    | 'exists';
    /**
     * Allows case sensitive matching of the value with the indexed attribute values when set to true. Default is false which means the case insensitivity of matching.
     */
    case_sensitive?: boolean;
}
export interface SequenceQueryParameters {
    /**
     * Protein or nucleotide sequence represented in the standard IUB/IUPAC amino acid and nucleic acid 1-letter codes
     */
    value: string;
    /**
     * Identifies a specific search scope. Deprecated since 2.1.0. Use 'sequence_type' parameter
     */
    target?: 'pdb_protein_sequence' | 'pdb_rna_sequence' | 'pdb_dna_sequence';
    /**
     * Indicates if the sequence is protein, DNA or RNA sequences
     */
    sequence_type?: 'protein' | 'rna' | 'dna';
    /**
     * Hits with sequence identity below this cutoff value are filtered out (range 0-1)
     */
    identity_cutoff?: number;
    /**
     * The expectation value (e-value) threshold measures the number of expected matches in a random database. The lower the e-value, the more likely the match is to be significant. Hits with e-value above this cutoff are filtered out
     */
    evalue_cutoff?: number;
}
export interface StructureQueryParameters {
    value:
    | StructureQueryChainParameters
    | StructureQueryAssemblyParameters
    | StructureQueryFileParameters
    | StructureQueryURLParameters;
    /**
     * The operator allows specifying the evaluation expression.
     */
    operator?: 'strict_shape_match' | 'relaxed_shape_match';
    /**
     * Controls what are the target objects (assemblies or polymer instances) against which the query will be compared for shape similarity. If not provided, queries based on assembly identifiers are matched to assemblies, queries based on chain identifiers are match to chains (polymer entity instances), and queries based on URLs or files are matched to chains. Note that this parameter is independent of whether the input is a chain or an assembly. For instance a chain can be compared to all assemblies.
     */
    target_search_space?: 'assembly' | 'polymer_entity_instance';
}
/**
 * Compound structure identifier that includes PDB code and chain identifier.
 */
export interface StructureQueryChainParameters {
    /**
     * The PDB code that defines the structure.
     */
    entry_id: string;
    /**
     * The chain identifier.
     */
    asym_id: string;
}
/**
 * Compound structure identifier that includes PDB code and assembly identifier
 */
export interface StructureQueryAssemblyParameters {
    /**
     * The PDB code that defines the structure.
     */
    entry_id: string;
    /**
     * The assembly identifier.
     */
    assembly_id: string;
}
/**
 * Upload Base64-encoded file in one of the following formats: cif, bcif, pdb.
 */
export interface StructureQueryFileParameters {
    /**
     * File content converted to a Base64 string.
     */
    data: string;
    format: 'cif' | 'bcif' | 'pdb';
}
/**
 * Fetch structure file from a URL in one of the following formats: cif, bcif, pdb. Content can be gzipped.
 */
export interface StructureQueryURLParameters {
    /**
     * URL to a publicly available file with structure data.
     */
    url: string;
    format: 'cif' | 'bcif' | 'pdb';
}
export interface ChemicalQueryFormulaParameters {
    /**
     * Type of chemical search.
     */
    type: 'formula';
    /**
     * Molecular formula.
     */
    value: string;
    /**
     * Find formulas satisfying only a subset of the query conditions.
     */
    match_subset?: boolean;
}
export interface ChemicalQueryDescriptorParameters {
    /**
     * Type of chemical search.
     */
    type: 'descriptor';
    /**
     * SMILES or InChI chemical descriptor.
     */
    value: string;
    /**
     * Type of chemical descriptor (SMILES or InChI).
     */
    descriptor_type: 'SMILES' | 'InChI';
    /**
     * Qualitative graph matching or fingerprint comparison criteria, with adding the aromatic criteria. The following graph matching searches use a fingerprint prefilter so these are designed to find only similar molecules. These graph matching comparisons include: graph-exact (atom type, formal charge, aromaticity, bond order, atom/bond stereochemistry, valence degree, atom hydrogen count), graph-strict (atom type, formal charge, aromaticity, bond order, atom/bond stereochemistry, ring membership and valence degree), graph-relaxed (atom type, formal charge, bond type), graph-relaxed-stereo (atom type, formal charge, bond type, atom/bond stereochemistry), fingerprint-similarity (TREE and MACCS). The following graph matching searches perform an exhaustive substructure search with no pre-screening. These substructure graph matching comparisons include: sub-struct-graph-exact (atom type, formal charge, aromaticity, bond order, atom/bond stereochemistry, valence degree, atom hydrogen count), sub-struct-graph-strict (atom type, formal charge, aromaticity, bond order, atom/bond stereochemistry, ring membership and valence degree), sub-struct-graph-relaxed (atom type, formal charge, bond type), sub-struct-graph-relaxed-stereo (atom type, formal charge, bond type, atom/bond stereochemistry)
     */
    match_type?:
    | 'graph-exact'
    | 'graph-strict'
    | 'graph-relaxed'
    | 'graph-relaxed-stereo'
    | 'fingerprint-similarity'
    | 'sub-struct-graph-exact'
    | 'sub-struct-graph-strict'
    | 'sub-struct-graph-relaxed'
    | 'sub-struct-graph-relaxed-stereo';
}
export interface SeqmotifQueryParameters {
    /**
     * Protein sequence pattern
     */
    value: string;
    /**
     * Identifies a specific search scope. Deprecated since 2.1.0. Use 'sequence_type' parameter
     */
    target?: 'pdb_protein_sequence' | 'pdb_rna_sequence' | 'pdb_dna_sequence';
    /**
     * Indicates if the sequence is protein, DNA or RNA sequences
     */
    sequence_type?: 'protein' | 'rna' | 'dna';
    /**
     * Identifies the pattern type of the value parameter
     */
    pattern_type: 'simple' | 'prosite' | 'regex';
}
export interface StrucmotifQueryParameters {
    value: StrucmotifQueryEntryParameters | StrucmotifQueryFileParameters | StrucmotifQueryURLParameters;
    /**
     * Allowed backbone distance tolerance in Angstrom.
     */
    backbone_distance_tolerance?: number;
    /**
     * Allowed side-chain distance tolerance in Angstrom.
     */
    side_chain_distance_tolerance?: number;
    /**
     * Allowed angle tolerance in multiples of 20 degrees.
     */
    angle_tolerance?: number;
    /**
     * Threshold above which hits will be filtered by RMSD.
     */
    rmsd_cutoff?: number;
    /**
     * Specifies all allowed amino acids at a certain position. You can specify non more than 16 allowed residues in total
     */
    exchanges?: {
        residue_id: ResidueIdentifier;
        allowed?: (
            | 'ALA'
            | 'CYS'
            | 'ASP'
            | 'GLU'
            | 'PHE'
            | 'GLY'
            | 'HIS'
            | 'ILE'
            | 'LYS'
            | 'LEU'
            | 'MET'
            | 'ASN'
            | 'PYL'
            | 'PRO'
            | 'GLN'
            | 'ARG'
            | 'SER'
            | 'THR'
            | 'SEC'
            | 'VAL'
            | 'TRP'
            | 'TYR'
            | 'DA'
            | 'DC'
            | 'DG'
            | 'DI'
            | 'DT'
            | 'DU'
            | 'A'
            | 'C'
            | 'G'
            | 'I'
            | 'U'
            | 'UNK'
            | 'N'
        )[];
    }[];
    /**
     * Optionally: Stop after accepting this many hits.
     */
    limit?: number;
    /**
     * Which atoms to consider to compute RMSD scores and transformations.
     */
    atom_pairing_scheme?: 'ALL' | 'BACKBONE' | 'SIDE_CHAIN' | 'PSEUDO_ATOMS';
    /**
     * Specifies how query motifs are pruned (i.e. simplified). The default option 'KRUSKAL' determines the minimum spanning tree of residue pairs in the query. This leads to less stringent queries and faster results.
     */
    motif_pruning_strategy?: 'NONE' | 'KRUSKAL';
    /**
     * If the list of structure identifiers is specified, the search will only consider those structures
     */
    allowed_structures?: string[];
    /**
     * If the list of structure identifiers is specified, the search will exclude those structures from the search space
     */
    excluded_structures?: string[];
}
/**
 * Compound structure identifier that includes PDB code and residue identifiers.
 */
export interface StrucmotifQueryEntryParameters {
    /**
     * The PDB code that defines the structure with the query motif.
     */
    entry_id: string;
    /**
     * Provides the set of residue identifiers that define the query.
     */
    residue_ids: ResidueIdentifier[];
}
export interface ResidueIdentifier {
    /**
     * Chain identifier of this residue.
     */
    label_asym_id: string;
    /**
     * Identifier of the assembly generating operation that was used to determine the coordinates of this residue. Chaining of operations is expressed by '1stx2nd'.
     */
    struct_oper_id?: string;
    /**
     * Sequence identifier of this residue.
     */
    label_seq_id: number;
}
/**
 * Upload Base64-encoded file in one of the following formats: cif, bcif.
 */
export interface StrucmotifQueryFileParameters {
    /**
     * File content converted to a Base64 string
     */
    data: string;
    format: 'cif' | 'bcif';
    /**
     * Provides the set of residue identifiers that defines the query. Can be undefined if the submitted file property contains an extracted motif.
     */
    residue_ids?: ResidueIdentifier[];
}
/**
 * Fetch structure file from a URL in one of the following formats: cif, bcif. Content can be gzipped.
 */
export interface StrucmotifQueryURLParameters {
    /**
     * URL to a publicly available file with structure data.
     */
    url: string;
    format: 'cif' | 'bcif';
    /**
     * Provides the set of residue identifiers that defines the query. Can be undefined if the submitted file property contains an extracted motif.
     */
    residue_ids?: ResidueIdentifier[];
}
