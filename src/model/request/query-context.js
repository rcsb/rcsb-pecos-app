import Method from './method';
import StructureEntry from './structure-entry';
import StructureFile from './structure-file';
import StructureWebLink from './structure-web-link';
import InputOptionsEnum from '../enum/enum-input-options';

import { DEFAULT_ALIGNMENT_MODE } from '../enum/enum-alignment-mode';

function createStructure(type) {
    const id = type.id;
    switch (id) {
        case InputOptionsEnum.PDB_ENTRY.id:
            return new StructureEntry();
        case InputOptionsEnum.FILE_UPLOAD.id:
            return new StructureFile();
        case InputOptionsEnum.WEB_LINK.id:
            return new StructureWebLink();
        default:
            throw new Error('Unsupported input type: ', type);
    }
}

class QueryContext {
    mode;
    method;
    structures;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() {
        this.mode = DEFAULT_ALIGNMENT_MODE;
        this.structures = [new StructureEntry(), new StructureEntry()];
    }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
        this.method = new Method(obj.method);
        this.structures = obj.structures.map(s => {
            if (s.entry_id) return new StructureEntry(s);
            else if (s.url) return new StructureWebLink(s);
            else if (s.format) return new StructureFile(s);
            else throw new Error('Unsupported structure type: [ ' + JSON.stringify(s) + ' ]');
        });
    }

    setMode(mode) {
        this.mode = mode;
    }
    getMode() {
        return this.mode;
    }
    setMethod(method) {
        this.method = method;
    }
    getMethod() {
        if (!this.method) this.method = new Method();
        return this.method;
    }
    setStructures(structures) {
        this.structures = structures;
    }
    getStructures() {
        if (!this.structures) this.structures = [];
        return this.structures;
    }
    setStructure(index, s) {
        this.structures[index] = s;
    }
    getStructure(index, type) {
        if (!this.getStructures()[index]) {
            this.setStructure(index, createStructure(type));
        }
        return this.structures[index];
    }
    addStructure(type) {
        this.getStructures().push(createStructure(type));
        return this.getStructures().map(s => s.getType());
    }
    deleteStructure(index) {
        const updated = [...this.getStructures()];
        updated.splice(index, 1);
        this.setStructures(updated);
        return this.getStructures().map(s => s.getType());
    }
    resetStructure(index, type) {
        const s = createStructure(type);
        this.setStructure(index, s);
        return this.getStructures().map(s => s.getType());
    }
}

export default QueryContext;