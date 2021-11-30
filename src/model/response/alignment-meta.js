class AlignmentMetadata {
    alignment_mode;
    algorithm_name;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    getAlignmentMode() {
        return this.alignment_mode;
    }

    getAlgorithmName() {
        return this.algorithm_name;
    }
}

export default AlignmentMetadata;