import InstanceSelection from './instance-selection';
import InputOptionsEnum from '../enum/enum-input-options';

class StructureEntry {
    entry_id;
    selection;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { }

    _constructFromObject(obj) {
        this.entry_id = obj.entry_id;
        this.selection = new InstanceSelection(obj.selection);
    }

    setEntryId(id) {
        this.entry_id = id;
    }
    getEntryId() {
        return this.entry_id;
    }
    setSelection(sele) {
        this.selection = sele;
    }
    getSelection() {
        if (!this.selection) this.selection = new InstanceSelection();
        return this.selection;
    }
    isValidId() {
        return this.entry_id && this.entry_id.length === 4;
    }
    isValid() {
        return this.isValidId() && this.getSelection().isValid();
    }
    getInstanceId() {
        return `${this.entry_id}.${this.getSelection().getAsymId()}`
    }    
    getType() {
        return InputOptionsEnum.PDB_ENTRY.id;
    }
}

export default StructureEntry;