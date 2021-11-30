import PresetRange from "./preset-range";

class PresetColorProp {
    name;
    value;
    positions;

    constructor() {
        this.name='color';
    }

    getName() {
        return this.name;
    }
    setValue(value) {
        this.value=value;
    }
    getValue() {
        return this.value;
    }
    setPositions(positions) {
        this.positions=positions;
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