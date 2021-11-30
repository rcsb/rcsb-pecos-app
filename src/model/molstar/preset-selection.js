import PresetSeqRange from "./preset-seq-range";

class PresetSelection {
    label_asym_id;
    label_seq_id;
    matrix;

    constructor() {}

    getlLabelAsymId() {
        return this.label_asym_id;
    }
    setMatrix(matrix) {
        this.matrix=matrix;
    }
    getMatrix() {
        return this.matrix;
    }
    addRange(asym, beg, end) {
        asym ? this.label_asym_id = asym : undefined;
        beg ? this.label_seq_id = new PresetSeqRange(beg, end) : undefined;
    }
}

export default PresetSelection;