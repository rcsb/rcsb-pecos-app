/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BehaviorSubject } from 'rxjs';
import { AppConfigs } from './index';
import { RequestState } from './state/request';
import { ResponseState } from './state/response';
import { QueryRequest } from './utils/request';
import { StructureAlignmentProvider } from './provider/alignment-provider';
import { DataProvider } from './provider/data-provider';
import { SearchProvider } from './provider/search-provider';
import { StructureAlignmentResponse, StructureInstanceSelection } from './auto/alignment/alignment-response';
import { getCombinedInstanceIds } from './utils/identifier';
import { isEntry } from './utils/helper';
import { AlignmentManager } from './manager/alignment-maganger';
import { urlParamEncoding, urlParamRequestBody, urlParamResponseBody } from './utils/constants';
import { decodeBase64ToJson } from './utils/encoding';

export type Status = 'init' | 'loading' | 'ready' | 'error';
export type DownloadOptions = 'structure' | 'sequence' | 'transform' | 'all' | undefined;
export type SelectionOptions = 'residues' | 'polymer' | 'structure' | undefined;

export class ApplicationContext {

    private readonly _gql: DataProvider;
    private readonly _search: SearchProvider;
    private readonly _manager: AlignmentManager;
    private readonly _alignment: StructureAlignmentProvider;

    readonly state = {
        events: {
            status: new BehaviorSubject<Status>('init'),
            download: new BehaviorSubject<DownloadOptions>(undefined),
            selection: new BehaviorSubject<SelectionOptions>(undefined),
            target: new BehaviorSubject<number>(0)
        },
        data: {
            request: new RequestState(),
            response: new ResponseState()
        }
    } as const;

    constructor(public configs: AppConfigs) {
        this._gql = new DataProvider(configs.service.data);
        this._search = new SearchProvider(configs.service.search, this.error.bind(this));
        this._alignment = new StructureAlignmentProvider(configs.service.alignment);
        this._manager = new AlignmentManager();
    }

    async init() {
        const url = window.location.search;
        const params = new URLSearchParams(url);
        if (params.has('uuid')) {
            // running alignment job can take time, we do not want the user to stop polling on page reload
            const uuid = params.get('uuid')!;
            const response = await this._alignment.results(uuid);
            this.processResponse(response);
        } else if (params.has(urlParamRequestBody)) {
            // request data can be passed as URL parameter
            const data = params.get(urlParamRequestBody)!;
            const json = JSON.parse(data);
            const request = new QueryRequest(json);
            await this.align(request);
        } else if (params.has(urlParamResponseBody)) {
            // response data can be passed as URL parameter
            const needsDecoding = params.get(urlParamEncoding) && params.get(urlParamEncoding) === 'true';
            const data = params.get(urlParamResponseBody)!;
            const json = (needsDecoding) ? decodeBase64ToJson(data) : JSON.parse(data);
            this.ready(json);
        }
    }

    data() {
        return this._gql;
    }

    search() {
        return this._search;
    }

    manager() {
        return this._manager;
    }

    /**
     * Default selection option depends on the method type
     *
     * @returns default selection option
     */
    private selection(): SelectionOptions {
        const method = this.state.data.request.state.query.context.method.name;
        if (method === 'fatcat-flexible' || method === 'ce-cp') return 'residues';
        else return 'polymer';
    }

    private loading() {
        this.state.events.status.next('loading');
        this.state.events.selection.next(undefined);
    }

    private ready(response: StructureAlignmentResponse) {
        this.state.data.response.push(response);
        this.state.events.selection.next(this.selection());
        this.state.events.status.next('ready');
        updateWindowURL();
    }

    private error(message: string) {
        const response: StructureAlignmentResponse = {
            info: {
                uuid: '',
                status: 'ERROR',
                message: message
            }
        };
        this.state.data.response.push(response);
        this.state.events.status.next('error');
        updateWindowURL();
    }

    /**
     * If sequence alignment data doesn't contain polymer sequences, fetch them
     * from the API and add them to the response object
     *
     * @param response alignment API response
     */
    private async addMissingSequences(response: StructureAlignmentResponse) {
        const ids = getCombinedInstanceIds(response.results);
        const data = await this._gql.polymerInstances(ids);
        response.results?.forEach(a => {
            if (!a.sequence_alignment) return;
            for (let i = 0; i < a.sequence_alignment.length; i++) {
                const s = a.structures[i];
                const name = isEntry(s) ? s.entry_id : s.name;
                const sele = s.selection as StructureInstanceSelection;
                if (!a.sequence_alignment[i].sequence) {
                    const instance = data.filter(d => d.entry_id === name && d.asym_id === sele.asym_id)[0];
                    a.sequence_alignment[i]['sequence'] = instance.pdbx_seq_one_letter_code;
                }
            }
        });
    }

    private async processResponse(response: StructureAlignmentResponse) {
        if (response.info.status === 'COMPLETE') {
            await this.addMissingSequences(response);
            await this._manager.init(this._gql, response);
            this.ready(response);
        } else if (response.info.status === 'ERROR') {
            this.state.data.response.push(response);
            this.state.events.status.next('error');
        }
    }

    public async align(request: QueryRequest) {
        this.loading();
        const uuid = await this._alignment.submit(request);
        updateWindowURL('?uuid=' + uuid);

        const response = await this._alignment.results(uuid);
        this.processResponse(response);
    }
}

function updateWindowURL(url?: string) {
    if (window) {
        if (!url) url = window.location.href.split('?')[0];
        window.history.replaceState({}, '', url);
    }
}
