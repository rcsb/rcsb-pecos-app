import PresetRange from './preset-range';

class PresetColorProp {
    name;
    value;
    positions;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { this.name = 'color'; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    getName() {
        return this.name;
    }
    setValue(value) {
        this.value = value;
    }
    getValue() {
        return this.value;
    }
    setPositions(positions) {
        this.positions = positions;
    }
    getPositions() {
        if (!this.positions) this.positions = [];
        return this.positions;
    }
    addPositions(asym, beg, end) {
        this.getPositions().push(new PresetRange(asym, beg, end));
    }
}

export default PresetColorProp;