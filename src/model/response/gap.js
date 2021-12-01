class AlignmentGap {
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

export default AlignmentGap;