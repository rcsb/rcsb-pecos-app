/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BehaviorSubject } from 'rxjs';
import { AppConfigs } from './index';
import { RequestState } from './state/request';
import { ResponseState } from './state/response';
import { QueryRequest, StructureFileUploadImpl, StructureWebLinkImpl } from './utils/request';
import { StructureAlignmentProvider } from './provider/alignment-provider';
import { DataProvider } from './provider/data-provider';
import { SearchProvider } from './provider/search-provider';
import { StructureAlignmentMetadata, StructureAlignmentResponse, StructureInstanceSelection } from './auto/alignment/alignment-response';
import { getCombinedInstanceIds } from './utils/identifier';
import { isEntry, buildError, getTransformationType } from './utils/helper';
import { AlignmentManager } from './manager/alignment-manager';
import { encodingUrlParam, requestUrlParam, responseUrlParam, uuidUrlParam } from './utils/constants';
import { decodeBase64ToJson } from './utils/encoding';
import { FileUploadManager } from './manager/file-upload-manager';

export type Status = 'init' | 'loading' | 'ready' | 'error';
export type DownloadOptions = 'structure' | 'sequence' | 'transform' | 'all' | undefined;
export type SelectionOptions = 'residues' | 'polymer' | 'structure' | undefined;

export class ApplicationContext {

    private readonly _gql: DataProvider;
    private readonly _search: SearchProvider;
    private readonly _manager: AlignmentManager;
    private readonly _alignment: StructureAlignmentProvider;
    private readonly _files: FileUploadManager;

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
        this._gql = new DataProvider(configs.service.data, this.error.bind(this));
        this._search = new SearchProvider(configs.service.search, this.error.bind(this));
        this._alignment = new StructureAlignmentProvider(configs.service.alignment);
        this._manager = new AlignmentManager();
        this._files = new FileUploadManager(configs.service.fileUpload);
    }

    async init() {
        const url = window.location.search;
        const params = new URLSearchParams(url);
        if (params.has(uuidUrlParam)) {
            // running alignment job can take time, we do not want the user to stop polling on page reload
            const uuid = params.get(uuidUrlParam)!;
            const response = await this._alignment.results(uuid);
            this.processResponse(response);
        } else if (params.has(responseUrlParam)) {
            // response data can be passed as URL parameter
            const needsDecoding = params.get(encodingUrlParam) && params.get(encodingUrlParam) === 'true';
            const responseData = params.get(responseUrlParam)!;
            const response = (needsDecoding) ? decodeBase64ToJson(responseData) : JSON.parse(responseData);
            this.processResponse(response);
            if (params.has(requestUrlParam)) {
                const requestData = params.get(requestUrlParam)!;
                const request = (needsDecoding) ? decodeBase64ToJson(requestData) : JSON.parse(requestData);
                const query = new QueryRequest(request);
                this.state.data.request.push(query);
            }
        } else if (params.has(requestUrlParam)) {
            // request data can be passed as URL parameter
            const data = params.get(requestUrlParam)!;
            const json = JSON.parse(data);
            const request = new QueryRequest(json);
            this.state.data.request.push(request);
            await this.align(request);
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
    private selection(meta: StructureAlignmentMetadata): SelectionOptions {
        const type = getTransformationType(meta);
        return type === 'rigid' ? 'polymer' : 'residues';
    }

    private loading() {
        this.state.events.status.next('loading');
        this.state.events.selection.next(undefined);
    }

    private ready(response: StructureAlignmentResponse) {
        this.state.data.response.push(response);
        if (response.results) {
            this.state.events.status.next('ready');
            this.state.events.selection.next(this.selection(response.meta!));
        } else {
            this.error('Results MUST be provided');
        }
        updateWindowURL();
    }

    private error(message: string) {
        const response = buildError('', message);
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
    private async addPolymerSequences(response: StructureAlignmentResponse) {
        const ids = getCombinedInstanceIds(response.results);
        const data = await this._gql.polymerInstances(ids);
        response.results?.forEach(a => {
            if (!a.sequence_alignment) return;
            for (let i = 0; i < a.sequence_alignment.length; i++) {
                const s = a.structures[i];
                const name = isEntry(s) ? s.entry_id : s.name;
                const sele = s.selection as StructureInstanceSelection;
                if (!a.sequence_alignment[i].sequence) {
                    const instances = data.filter(d => d.entry_id === name && d.asym_id === sele.asym_id);
                    if (instances.length === 1)
                        a.sequence_alignment[i]['sequence'] = instances[0].pdbx_seq_one_letter_code_can;
                    else this.error(`Failed to fetch sequence for [ ${name}.${sele.asym_id} ]`);
                }
            }
        });
    }

    private async processResponse(response: StructureAlignmentResponse) {
        if (response.info.status === 'COMPLETE') {
            await this.addPolymerSequences(response);
            await this._manager.init(this._gql, response);
            this.ready(response);
        } else if (response.info.status === 'ERROR') {
            this.state.data.response.push(response);
            this.state.events.status.next('error');
        }
    }

    public request(): QueryRequest | null {
        if (this.state.events.status.getValue() === 'ready')
            return this.state.data.request.state;
        else return null;
    }

    public async align(request: QueryRequest) {
        this.loading();
        this.uploadAtomicCoordinateFiles(request)
            .then(() => {
                return this._alignment.submit(request);
            })
            .then((uuid) => {
                updateWindowURL('?uuid=' + uuid);
                return this._alignment.results(uuid);
            })
            .then((response) => {
                this.processResponse(response);
            })
            .catch((e) => this.error(e.message));
    }

    public async uploadAtomicCoordinateFiles(request: QueryRequest) {
        if (request.files && request.files.length > 0) {
            for (let j = 0; j < request.query.context.structures.length; j++) {
                const structure = request.query.context.structures[j];
                if (structure instanceof StructureFileUploadImpl) {
                    const file = request.files.shift()!;
                    const format = structure.format;
                    await this._files.upload(file, format)
                        .then((response) => {
                            const uploaded = new StructureWebLinkImpl();
                            uploaded.url = response.url;
                            uploaded.name = file.name;
                            uploaded.format = response.format;
                            uploaded.selection = structure.selection;
                            request.query.context.structures[j] = uploaded;
                        })
                        .catch((e) => this.error(e.message));
                }
            }
            this.state.data.request.push(request);
        }
    }
}

function updateWindowURL(url?: string) {
    if (window) {
        if (!url) url = window.location.href.split('?')[0];
        window.history.replaceState({}, '', url);
    }
}
