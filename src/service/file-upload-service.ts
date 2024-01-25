import { AppConfigs } from '..';
import { StructureFileFormat } from '../auto/alignment/alignment-request';
import { trimTrailingChars } from '../utils/helper';

type FileUploadConfigs = AppConfigs['service']['fileUpload'];

type FileUploadResponse = {
    url: string,
    format: StructureFileFormat
}

export class FileUploadProvider {

    private readonly _config;

    constructor(config: FileUploadConfigs) {
        this._config = config;
    }

    private fromApiToFileUplaod(format: StructureFileFormat): string {
        switch (format) {
            case 'mmcif':
                return 'cif';
            case 'pdb':
                return 'pdb';
            default:
                throw new Error('Unsupported file format: ' + format);
        }
    }

    private fromFileUplaodToApi(format: string): StructureFileFormat {
        switch (format) {
            case 'bcif':
            case 'cif':
                return 'mmcif';
            case 'pdb':
                return 'pdb';
            default:
                throw new Error('Unsupported file format: ' + format);
        }
    }

    private requestBody(file: File, format: StructureFileFormat): FormData {
        const data = new FormData();
        data.append('file', file);
        data.append('format', this.fromApiToFileUplaod(format));
        return data;
    }

    private uploadURL() {
        const base = trimTrailingChars(this._config.base, '/');
        return `${base}/${this._config.upload}`;
    }

    private downloadURL(key: string) {
        const base = trimTrailingChars(this._config.base, '/');
        return `${base}/${this._config.download}/${key}`;
    }

    public isServiceUrl(url: string) {
        return url.includes(this._config.base);
    }

    public async upload(file: File, format: StructureFileFormat): Promise<FileUploadResponse> {
        return fetch(this.uploadURL(), {
            method: 'POST',
            body: this.requestBody(file, format),
            headers: this._config.httpHeaders
        }).then(async response => {
            if (response.status === 200)
                return response.json();
            const error = await response.json();
            throw new Error(`Failed to upload file to the server: ${this.uploadURL()}. HTTP ${error.status}: ${error.message}`);
        }).then(json => {
            return {
                url: this.downloadURL(json.key),
                format: this.fromFileUplaodToApi(json.format)
            };
        }).catch(error => {
            throw new Error(`Failed to upload file to the server: ${this.uploadURL()}. Error: ${(error as Error).message}`);
        });
    }
}