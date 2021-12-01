class InstanceSelection {

    asym_id;
    beg_seq_id;
    end_seq_id;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    setAsymId(id) {
        this.asym_id = id;
    }
    getAsymId() {
        return this.asym_id;
    }
    setBegSeqId(id) {
        this.beg_seq_id = id;
    }
    getBegSeqId() {
        return this.beg_seq_id;
    }
    setEndSeqId(id) {
        this.end_seq_id = id;
    }
    getEndSeqId() {
        return this.end_seq_id;
    }
    _isValidId() {
        return this.asym_id && this.asym_id.length >= 1;
    }

    _isValidRange() {

        const beg = this.beg_seq_id;
        const end = this.end_seq_id;

        const isRangeOmitted = !beg && !end;
        const isRangeSet = (beg && end) ? true : false;
        const isRangeValid = isRangeSet ? end - beg > 9 : true;

        return isRangeOmitted || isRangeValid;
    }
    isValid() {
        return this._isValidId() && this._isValidRange();
    }
}

export default InstanceSelection;