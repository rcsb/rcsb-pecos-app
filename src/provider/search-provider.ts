import { AppConfigs } from '..';
import { SuggestQuery } from '../auto/search/suggest-request';
import { SuggesterResponse } from '../auto/search/suggest-response';
import { trimTrailingChars } from '../utils/helper';

type SearchProviderConfigs = AppConfigs['service']['search'];
export class SearchProvider {
    private readonly _config: SearchProviderConfigs;
    private readonly _errFn: (msg: string) => void;
    constructor(config: SearchProviderConfigs, onError: (msg: string) => void) {
        this._config = config;
        this._errFn = onError;
    }

    private async fetch(query: SuggestQuery) {
        const url = trimTrailingChars(this._config.base, '/') + '/' + this._config.suggest +
        '?json=' + encodeURIComponent(JSON.stringify(query));
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

    async suggestEntries(input: string): Promise<string[]> {
        const query: SuggestQuery = {
            type: 'term',
            suggest: {
                text: input,
                completion: [{ attribute: 'rcsb_entry_container_identifiers.entry_id' }],
                size: 10
            },
            results_content_type: ['experimental', 'computational']
        };
        const data = await this.fetch(query);
        if (!data) return [];
        return (data as SuggesterResponse).suggestions['rcsb_entry_container_identifiers.entry_id']
            .map(item => item.text.replace(/<em>/g, '').replace(/<\/em>/g, ''));
    }
}