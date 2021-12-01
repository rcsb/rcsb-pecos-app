import InstanceSelection from '../request/instance-selection';

class StructureURL {
    url;
    name;
    format;
    is_binary;
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

    setURL(url) {
        this.url = url;
    }
    getURL() {
        return this.url;
    }
    getName() {
        return this.name;
    }
    setName(name) {
        this.name = name;
    }
    setFormat(format) {
        this.format = format;
    }
    getFormat() {
        return this.format;
    }
    isBinary() {
        return this.is_binary;
    }
    setSelection(sele) {
        this.selection = sele;
    }
    getSelection() {
        if (!this.selection) this.selection = new InstanceSelection();
        return this.selection;
    }
}

export default StructureURL;