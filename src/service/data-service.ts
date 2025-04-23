/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AppConfigs } from '..';
import { AsymIdsQueryVariables, PolymerInstancesQueryVariables, Query, SequenceLengthQueryVariables } from '../auto/data/graphql';
import { asymIdsQuery, polymerInstancesQuery, referenceSequenceCoverageQuery, sequenceLengthQuery } from '../auto/data/query.gql';
import { memoizeOneArgAsync, trimTrailingChars } from '../utils/helper';

export type InstanceData = {
    entry_id: string,
    asym_id: string,
    auth_asym_id?: string,
    pdbx_description?: string,
    ncbi_scientific_name?: string,
    ncbi_parent_scientific_name?: string
    pdbx_seq_one_letter_code_can?: string,
    rcsb_sample_sequence_length?: number,
    experimental_method?: string,
    resolution_combined?: number[],
    ma_qa_metric_global?: number
};

type DataProviderConfigs = AppConfigs['service']['data'];
export class DataService {
    private readonly _config: DataProviderConfigs;
    private readonly _errFn: (msg: string) => void;
    constructor(config: DataProviderConfigs, onError: (msg: string) => void) {
        this._config = config;
        this._errFn = onError;
        this.asymIds = this.asymIds.bind(this);
        this.polymerInstances = memoizeOneArgAsync(this.polymerInstances.bind(this));
    }

    private async fetch<V>(query: string, variables: V) {
        // Issuing GET request helps avoiding costly pre-flight CORS requests
        const url = trimTrailingChars(this._config.base, '/') + '/' + this._config.gql +
        '?query=' + encodeURIComponent(query) +
        '&variables=' + encodeURIComponent(JSON.stringify(variables));
        return fetch(url, {
            method: 'GET',
            headers: this._config.httpHeaders
        })
            .then(response => response.json())
            .then(json => {
                if (json.data)
                    return json.data as Query;
                else this._errFn('Failed to fetch data from [ ' + url + ' ]: ' + json.error);
            });
    }

    /**
     * Queries Data API to fetch asym IDs for polymer sequences:
     * - protein sequences
     * - at least 10 residues long
     *
     * @param entryId entry ID
     * @returns list of asym ID pairs: _label_asym_id and _auth_asym_id
     */
    async asymIds(entryId: string): Promise<string[][]> {
        const vars: AsymIdsQueryVariables = { id: entryId };
        const data = await this.fetch<AsymIdsQueryVariables>(asymIdsQuery, vars);
        if (!data || !data.entry || !data.entry.polymer_entities) return [];

        if (data.entry.rcsb_entry_info.ihm_multi_scale_flag && data.entry.rcsb_entry_info.ihm_multi_scale_flag === 'Y') {
            this._errFn(entryId + ' is a multi-scale integrative structure and lacks atomic-level chains required for structure alignment using the available alignment methods');
            return [];
        }

        const proteins = data.entry.polymer_entities.filter(entity =>
            entity &&
            entity.entity_poly &&
            entity.entity_poly.rcsb_entity_polymer_type === 'Protein' &&
            entity.entity_poly.rcsb_sample_sequence_length &&
            entity.entity_poly.rcsb_sample_sequence_length >= 10);
        if (proteins.length === 0) return [];
        const asyms: string[][] = [];
        proteins?.forEach(p => p?.polymer_entity_instances?.forEach(i => {
            const asym = i?.rcsb_polymer_entity_instance_container_identifiers?.asym_id;
            const auth = i?.rcsb_polymer_entity_instance_container_identifiers?.auth_asym_id;
            if (asym && auth) asyms.push([asym, auth]);
        }));
        asyms.sort((a, b) => {
            if (a[0] === b[0]) return 0;
            else return (a[0] < b[0]) ? -1 : 1;
        });
        return asyms;
    }

    async polymerInstances(ids: string[]): Promise<InstanceData[]> {
        const vars: PolymerInstancesQueryVariables = { ids: ids };
        const data = await this.fetch<PolymerInstancesQueryVariables>(polymerInstancesQuery, vars);
        if (data && data.polymer_entity_instances) {
            return data.polymer_entity_instances.map(i => {
                const entry = i!.polymer_entity!.entry!;
                const entity = i!.polymer_entity!;
                const scientificName = (entity.rcsb_entity_source_organism)
                    ? entity.rcsb_entity_source_organism.map(o => o?.ncbi_scientific_name).join(', ')
                    : undefined;
                const scientificParentName = (entity.rcsb_entity_source_organism)
                    ? entity.rcsb_entity_source_organism.map(o => o?.ncbi_parent_scientific_name).join(', ')
                    : undefined;
                const method = entry.rcsb_entry_info.experimental_method
                    ? entry.rcsb_entry_info.experimental_method
                    : undefined;
                const resolution = entry.rcsb_entry_info.resolution_combined
                    ? entry.rcsb_entry_info.resolution_combined as number[]
                    : undefined;
                const pLDDT = (entry.rcsb_ma_qa_metric_global)
                    ? entry.rcsb_ma_qa_metric_global[0]?.ma_qa_metric_global?.filter(function (el) {
                        return el?.type === 'pLDDT';
                    })[0]?.value
                    : undefined;
                return {
                    entry_id: entry.rcsb_id,
                    asym_id: i!.rcsb_polymer_entity_instance_container_identifiers!.asym_id as string,
                    auth_asym_id: i!.rcsb_polymer_entity_instance_container_identifiers!.auth_asym_id as string,
                    pdbx_description: entity.rcsb_polymer_entity?.pdbx_description as string,
                    ncbi_scientific_name: scientificName,
                    ncbi_parent_scientific_name: scientificParentName,
                    pdbx_seq_one_letter_code_can: entity.entity_poly!.pdbx_seq_one_letter_code_can as string,
                    rcsb_sample_sequence_length: entity.entity_poly!.rcsb_sample_sequence_length as number,
                    experimental_method: method,
                    resolution_combined: resolution,
                    ma_qa_metric_global: pLDDT
                };
            });
        }
        return [];
    }

    async referenceSequenceCoverage(instanceIds: string[], uniprotId: string): Promise<Map<string, [][]>> {
        const coverage = new Map();
        const vars: PolymerInstancesQueryVariables = { ids: instanceIds };
        const data = await this.fetch<PolymerInstancesQueryVariables>(referenceSequenceCoverageQuery, vars);
        if (data && data.polymer_entity_instances) {
            data.polymer_entity_instances.map(i => {
                const key = i?.rcsb_id;
                coverage.set(key, []);
                i?.polymer_entity!.rcsb_polymer_entity_align?.map(r => {
                    if (r?.reference_database_accession === uniprotId) {
                        r.aligned_regions?.map(o => {
                            coverage.get(key).push([o?.ref_beg_seq_id, o?.ref_beg_seq_id! + o?.length! - 1]);
                        });
                    }
                });
            });
        }
        return coverage;
    }

    async sequenceLength(entryId: string, asymId: string): Promise<number> {
        const vars: SequenceLengthQueryVariables = {
            entryId: entryId,
            asymId: asymId
        };
        const data = await this.fetch<SequenceLengthQueryVariables>(sequenceLengthQuery, vars);
        if (data && data.polymer_entity_instance) {
            return data.polymer_entity_instance.polymer_entity!.entity_poly!.rcsb_sample_sequence_length!;
        }
        return 0;
    }
}