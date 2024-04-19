/* eslint-disable @typescript-eslint/no-non-null-assertion */
import clonedeep from 'lodash.clonedeep';

import { BehaviorSubject } from 'rxjs';
import { AppConfigs } from './index';
import { RequestState } from './state/request';
import { ResponseState } from './state/response';
import { QueryRequest, StructureFileUploadImpl, StructureWebLinkImpl } from './utils/request';
import { StructureAlignmentMetadata, StructureAlignmentResponse, StructureInstanceSelection } from './auto/alignment/alignment-response';
import { getCombinedInstanceIds } from './utils/identifier';
import { isEntry, buildError, getTransformationType, isBookmarkableResult, createBookmarkableResultsURL, updateWindowURL } from './utils/helper';
import { encodingUrlParam, requestUrlParam, responseUrlParam, uuidUrlParam } from './utils/constants';
import { decodeBase64ToJson } from './utils/encoding';

import { DataService } from './service/data-service';
import { SearchService } from './service/search-service';
import { FileUploadService } from './service/file-upload-service';
import { StructureAlignmentService } from './service/alignment-service';
import { OptionState } from './state/option';

export type Status = 'init' | 'loading' | 'ready' | 'error';
export type DownloadOptions = 'structure' | 'sequence' | 'transform' | 'all' | undefined;
export type SelectionOptions = 'residues' | 'polymer' | 'structure' | undefined;

export class ApplicationContext {

    private readonly _gql: DataService;
    private readonly _search: SearchService;
    private readonly _alignment: StructureAlignmentService;
    private readonly _files: FileUploadService;

    readonly state = {
        events: {
            status: new BehaviorSubject<Status>('init'),
            download: new BehaviorSubject<DownloadOptions>(undefined),
            selection: new BehaviorSubject<SelectionOptions>(undefined),
            target: new BehaviorSubject<number>(0)
        },
        data: {
            options: new OptionState(),
            request: new RequestState(),
            response: new ResponseState()
        }
    } as const;

    constructor(public configs: AppConfigs) {
        this._gql = new DataService(configs.service.data, this.error.bind(this));
        this._search = new SearchService(configs.service.search, this.error.bind(this));
        this._alignment = new StructureAlignmentService(configs.service.alignment);
        this._files = new FileUploadService(configs.service.fileUpload);
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
            await this.addResidueRanges(request);
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

    files() {
        return this._files;
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

        const newUrl = (isBookmarkableResult(response))
            ? createBookmarkableResultsURL(this.state.data.request.state, response)
            : undefined;
        updateWindowURL(newUrl, true);
    }

    public error(message: string) {
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

    private async addResidueRanges(request: QueryRequest) {
        for (const s of request.query.context.structures) {
            if (isEntry(s)) {
                const sele = s.selection as StructureInstanceSelection;
                if (!sele.beg_seq_id) sele.beg_seq_id = 1;
                if (!sele.end_seq_id) this._gql.sequenceLength(s.entry_id, sele.asym_id)
                    .then(len => sele.end_seq_id = len);
            }
        }
    }

    private async processResponse(response: StructureAlignmentResponse) {
        if (response.info.status === 'COMPLETE') {
            await this.addPolymerSequences(response);
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
            .then()
            .catch((e) => this.error(e.message));
    }

    public async uploadAtomicCoordinateFiles(request: QueryRequest) {
        if (request.files && request.files.length > 0) {
            const cloneRequest = clonedeep(request);
            for (let j = 0; j < request.query.context.structures.length; j++) {
                const structure = request.query.context.structures[j];
                if (structure instanceof StructureFileUploadImpl) {
                    const file = cloneRequest.files[j]!;
                    const format = structure.format;
                    await this._files.upload(file, format)
                        .then(response => {
                            const uploaded = new StructureWebLinkImpl();
                            uploaded.url = response.url;
                            uploaded.name = file.name;
                            uploaded.format = response.format;
                            uploaded.selection = structure.selection;
                            cloneRequest.query.context.structures[j] = uploaded;
                            this.state.data.options.push('file-url', j);
                        })
                        .catch((e) => this.error(e.message));
                }
            }
            cloneRequest.files = [];
            this.state.data.request.push(cloneRequest);
        }
    }
}
