class QueryOptions {

    return_sequence_data;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj); 
    }

    setReturnSequenceData(f) {
        this.return_sequence_data = f;
    }

    getReturnSequenceData() {
        return this.return_sequence_data;
    }
}

export default QueryOptions;