import PresetSeqRange from './preset-seq-range';

class PresetRange {
    label_asym_id;
    label_seq_id;

    constructor(asym, beg, end) {
        asym ? this.label_asym_id = asym : undefined;
        beg ? this.label_seq_id = new PresetSeqRange(beg, end) : undefined;
    }

    getLabelAsymId() {
        return this.label_asym_id;
    }
    setLabelAsymId(label_asym_id) {
        this.label_asym_id = label_asym_id;
    }
    getLabelSeqId() {
        if (!this.label_seq_id) this.label_seq_id = new PresetSeqRange();
        return this.label_seq_id;
    }
}

export default PresetRange;