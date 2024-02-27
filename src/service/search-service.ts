import { AppConfigs } from '..';
import { SearchQuery } from '../auto/search/search-request';
import { QueryResult } from '../auto/search/search-response';
import { SuggestQuery } from '../auto/search/suggest-request';
import { SuggesterResponse } from '../auto/search/suggest-response';
import { trimTrailingChars } from '../utils/helper';

type SearchProviderConfigs = AppConfigs['service']['search'];
export class SearchService {
    private readonly _config: SearchProviderConfigs;
    private readonly _errFn: (msg: string) => void;
    constructor(config: SearchProviderConfigs, onError: (msg: string) => void) {
        this._config = config;
        this._errFn = onError;
    }

    private async sendGET(url: string) {
        const errorMessage = `Failed to fetch data from [ ${url} ]'`;
        return fetch(url, {
            method: 'GET',
            headers: this._config.httpHeaders
        }).then(r => {
            if (r.status === 200) return r.json();
            else if (r.status === 204) return null;
            else this._errFn(errorMessage);
        }).catch((error) => {
            throw this._errFn(errorMessage + ' Error: ' + error);
        });
    }

    private async returnSuggestions(query: SuggestQuery, name: string) {
        const url = trimTrailingChars(this._config.base, '/') + '/' + this._config.suggest +
        '?json=' + encodeURIComponent(JSON.stringify(query));
        const data = await this.sendGET(url);
        if (!data) return [];
        return (data as SuggesterResponse).suggestions[name]
            .map(item => item.text.replace(/<em>/g, '').replace(/<\/em>/g, ''));
    }

    private async returnSearch(query: SearchQuery) {
        const url = trimTrailingChars(this._config.base, '/') + '/' + this._config.search +
        '?json=' + encodeURIComponent(JSON.stringify(query));
        const data = await this.sendGET(url);
        if (!data) return [];
        return (data as QueryResult).result_set as string[];
    }

    async suggestEntriesByID(input: string): Promise<string[]> {
        const attribute = 'rcsb_entry_container_identifiers.entry_id';
        const query: SuggestQuery = {
            type: 'term',
            suggest: {
                text: input,
                completion: [{ attribute: attribute }],
                size: 10
            },
            results_content_type: ['experimental', 'computational']
        };
        return this.returnSuggestions(query, attribute);
    }

    async suggestUniprotID(input: string): Promise<string[]> {
        const attribute = 'rcsb_polymer_entity_container_identifiers.reference_sequence_identifiers.database_accession';
        const filter = [
            {
                'name': 'reference_sequence_identifiers',
                'values': [
                    'UniProt'
                ]
            }
        ];
        const query: SuggestQuery = {
            type: 'term',
            suggest: {
                text: input,
                completion: [{ attribute: attribute, filter: filter }],
                size: 10
            },
            results_content_type: ['experimental', 'computational']
        };
        return this.returnSuggestions(query, attribute);
    }

    async matchInstancesByUniProtId(input: string, rows: number): Promise<string[]> {
        const query: SearchQuery = {
            query: {
                type: 'group',
                logical_operator: 'and',
                nodes: [
                    {
                        type: 'terminal',
                        service: 'text',
                        parameters: {
                            attribute: 'rcsb_polymer_entity_container_identifiers.reference_sequence_identifiers.database_accession',
                            operator: 'exact_match',
                            value: input
                        }
                    },
                    {
                        type: 'terminal',
                        service: 'text',
                        parameters: {
                            attribute: 'rcsb_polymer_entity_container_identifiers.reference_sequence_identifiers.database_name',
                            operator: 'exact_match',
                            value: 'UniProt'
                        }
                    }
                ]
            },
            request_options: {
                paginate: {
                    rows: rows
                },
                sort: [
                    {
                        sort_by: 'rcsb_polymer_entity_container_identifiers.reference_sequence_identifiers.reference_sequence_coverage',
                        filter: {
                            type: 'terminal',
                            service: 'text',
                            parameters: {
                                attribute: 'rcsb_polymer_entity_container_identifiers.reference_sequence_identifiers.database_name',
                                operator: 'exact_match',
                                value: 'UniProt'
                            }
                        },
                        direction: 'desc'
                    },
                    {
                        sort_by: 'rcsb_entry_info.resolution_combined',
                        direction: 'asc'
                    }
                ],
                results_verbosity: 'compact',
                results_content_type: ['experimental', 'computational']
            },
            return_type: 'polymer_instance'
        };
        return this.returnSearch(query);
    }
}