import InstanceSelection from './instance-selection';
import InputOptionsEnum from '../enum/enum-input-options';
import { FILE_FORMAT_DEFAULT } from '../enum/enum-file-format';

class StructureWebLink {
    url;
    format;
    selection;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() {
        this.format = FILE_FORMAT_DEFAULT.value;
    }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
        this.selection = new InstanceSelection(obj.selection);
    }

    setURL(url) {
        this.url = url;
    }
    getURL() {
        return this.url;
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
        return this.url && this.getSelection().isValid();
    }
    getType() {
        return InputOptionsEnum.WEB_LINK.id;
    }
}

export default StructureWebLink;