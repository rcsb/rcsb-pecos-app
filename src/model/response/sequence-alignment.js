import AlignmentRegion from './region';
import AlignmentGap from './gap';

class SequenceAlignment {
    sequence;
    regions;
    gaps;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return undefined; }

    _constructFromObject(obj) {
        this.sequence = obj.sequence;
        this.regions = obj.regions && obj.regions.map(r => new AlignmentRegion(r));
        this.gaps = obj.gaps && obj.gaps.map(g => new AlignmentGap(g));
    }
    getSequence() {
        return this.sequence;
    }
    setSequence(sequence) {
        this.sequence = sequence;
    }
    getRegions() {
        return this.regions;
    }
    setRegions(regions) {
        this.regions = regions;
    }
    getGaps() {
        return this.gaps;
    }
    setGaps(gaps) {
        this.gaps = gaps;
    }
}

export default SequenceAlignment;