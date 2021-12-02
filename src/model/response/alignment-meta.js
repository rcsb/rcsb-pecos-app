class AlignmentMetadata {
    alignment_mode;
    alignment_method;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    getAlignmentMode() {
        return this.alignment_mode;
    }

    getAlignmentMethod() {
        return this.alignment_method;
    }
}

export default AlignmentMetadata;