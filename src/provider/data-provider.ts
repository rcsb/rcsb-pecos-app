/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { AppConfigs } from '..';
import { AsymIdsQueryVariables, PolymerInstancesQueryVariables, Query } from '../auto/data/graphql';
import { asymIdsQuery, polymerInstancesQuery } from '../auto/data/query.gql';
import { memoizeOneArgAsync } from '../utils/helper';

export type InstanceData = {
    entry_id: string,
    asym_id: string,
    auth_asym_id?: string,
    pdbx_description?: string,
    pdbx_seq_one_letter_code: string,
    rcsb_sample_sequence_length: number
};

type DataProviderConfigs = AppConfigs['service']['data'];
export class DataProvider {
    private readonly _config: DataProviderConfigs;
    constructor(config: DataProviderConfigs) {
        this._config = config;
        this.asymIds = memoizeOneArgAsync(this.asymIds.bind(this));
        this.polymerInstances = memoizeOneArgAsync(this.polymerInstances.bind(this));
    }

    private async fetch<V>(query: string, variables: V) {
        // Issuing GET request helps avoiding costly pre-flight CORS requests
        const url = this._config.base + '/' + this._config.gql +
        '?query=' + encodeURIComponent(query) +
        '&variables=' + encodeURIComponent(JSON.stringify(variables));
        return fetch(url, {
            method: 'GET',
            headers: this._config.httpHeaders
        }).then(response => response.json())
            .then(json => json.data as Query);
    }

    async asymIds(entryId: string): Promise<string[][]> {
        const vars: AsymIdsQueryVariables = { id: entryId };
        const data = await this.fetch<AsymIdsQueryVariables>(asymIdsQuery, vars);
        if (!data || !data.entry || !data.entry.polymer_entities) return [];
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
        if (!data || ! data.polymer_entity_instances) return [];
        return data.polymer_entity_instances.map(i => {
            return {
                entry_id: i!.polymer_entity!.entry!.rcsb_id,
                asym_id: i!.rcsb_polymer_entity_instance_container_identifiers!.asym_id as string,
                auth_asym_id: i!.rcsb_polymer_entity_instance_container_identifiers!.auth_asym_id as string,
                pdbx_description: i!.polymer_entity!.rcsb_polymer_entity?.pdbx_description as string,
                pdbx_seq_one_letter_code: i!.polymer_entity!.entity_poly!.pdbx_seq_one_letter_code_can as string,
                rcsb_sample_sequence_length: i!.polymer_entity!.entity_poly!.rcsb_sample_sequence_length as number
            };
        });
    }
}
