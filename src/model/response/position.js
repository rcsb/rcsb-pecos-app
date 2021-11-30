class AlignmentPosition {
    seq_id;
    index;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return undefined; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    getSeqId() {
        return this.seq_id;
    }
    setSeqId(seq_id) {
        this.seq_id=seq_id;
    }
    getIndex() {
        return this.index;
    }
    setIndex(index) {
        this.index=index;
    }
}

export default AlignmentPosition;