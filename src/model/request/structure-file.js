import InstanceSelection from './instance-selection';
import InputOptionsEnum from '../enum/enum-input-options';

class StructureFile {
    format;
    selection;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
        this.selection = new InstanceSelection(obj.selection);
    }

    setFormat(format) {
        this.format = format;
    }
    getFormat() {
        return this.format;
    }
    setSelection(sele) {
        this.selection = sele;
    }
    getSelection() {
        if (!this.selection) this.selection = new InstanceSelection();
        return this.selection;
    }
    isValid() {
        return this.format && this.getSelection().isValid();
    }
    getType() {
        return InputOptionsEnum.FILE_UPLOAD.id;
    }
}

export default StructureFile;