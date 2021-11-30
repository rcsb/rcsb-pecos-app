import { clean } from '../../utils/common';

class AllignmentScore {
    value;
    type;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return undefined; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    getValue() {
        return this.value;
    }
    setValue(in_value) {
        this.value = in_value;
    }
    getType() {
        return this.type;
    }
    setType(in_type) {
        this.type = in_type;
    }
    toString() {
        return JSON.stringify(this);
    }
    toObject() {
        const json = JSON.parse(this.toString());
        clean(json);
        return json;
    }
}

export default AllignmentScore;