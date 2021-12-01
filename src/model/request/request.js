import Query from './query';
import InputOptionsEnum from '../enum/enum-input-options';

import StructureEntry from './structure-entry';
import StructureFile from './structure-file';
import StructureWebLink from './structure-web-link';
import StructureFileFormatEnum from '../enum/enum-file-format';
import { clean } from '../../utils/common';

class QueryRequest {
    query;
    files;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return; }

    _constructFromObject(obj) {
        this.query = new Query(obj.query);
        this.files = obj.files;
    }

    getQuery() {
        if (!this.query) this.query = new Query();
        return this.query;
    }
    setQuery(query) {
        this.query = query;
    }
    getFile(index) {
        return this.getFiles()[index];
    }
    addFile(file, index) {
        const format = guessFileFormat(file);
        this.getQuery().getContext().getStructure(index, InputOptionsEnum.FILE_UPLOAD).setFormat(format);
        this.getFiles()[index] = file;
    }
    getFiles() {
        if (!this.files) this.files = [];
        return this.files;
    }
    setFiles(files) {
        this.files = files;
    }
    isSubmittable() {
        let count = 0;
        this.getQuery().getContext().getStructures().map(s => { s.isValid() && count++; });
        return count >= 2;
    }
    includeFiles() {
        for (const s of this.getQuery().getContext().getStructures()) {
            if (s instanceof StructureFile || s instanceof StructureWebLink) return true;
        }
        return false;
    }
    getInstances() {
        return this.getQuery().getContext().getStructures().map(s => {
            return (s instanceof StructureEntry) && s.getInstanceId();
        });
    }
    toFormData() {
        const data = new FormData();

        this.getQuery().setDefaultOptions(this.includeFiles());
        const json = this.getQuery().toObject();
        clean(json);
        clean(this.files);

        data.append('query', JSON.stringify(json));
        this.files && this.files.map(f => data.append('files', f));

        return data;
    }
}

function guessFileFormat(file) {
    if (file.name.includes('.cif') || file.name.includes('.bcif'))
        return StructureFileFormatEnum.MMCIF.value;
    else if (file.name.includes('.pdb') || file.name.includes('.ent'))
        return StructureFileFormatEnum.PDB.value;
}

export default QueryRequest;