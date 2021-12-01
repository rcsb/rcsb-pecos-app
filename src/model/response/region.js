class AlignmentRegion {
    asym_id;
    beg_seq_id;
    beg_index;
    length;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    getAsymId() {
        return this.asym_id;
    }
    setAsymId(asym_id) {
        this.asym_id = asym_id;
    }
    getBegSeqId() {
        return this.beg_seq_id;
    }
    setBegSeqId(beg_seq_id) {
        this.beg_seq_id = beg_seq_id;
    }
    getBegIndex() {
        return this.beg_index;
    }
    setBegIndex(beg_index) {
        this.beg_index = beg_index;
    }
    getLength() {
        return this.length;
    }
    setLength(length) {
        this.length = length;
    }
}

export default AlignmentRegion;