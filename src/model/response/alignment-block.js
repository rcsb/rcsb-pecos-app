import AlignmentRegion from './region';
import AlignmentSummary from './summary';

class StructureAlignmentBlock {
    summary;
    regions;
    transformations;
    
    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { }

    _constructFromObject(obj) {
        this.regions = obj.regions && obj.regions.map(arr => arr.map(r => new AlignmentRegion(r)));
        this.transformations = obj.transformations;
        this.summary = new AlignmentSummary(obj.summary);
    }

    getRegions() {
        return this.regions;
    }
    setRegions(in_regions) {
        this.regions = in_regions;
    }
    getTransformations() {
        return this.transformations;
    }
    setTransformations(in_transformations) {
        this.transformations = in_transformations;
    }
    getSummary() {
        if (!this.summary) this.summary = new AlignmentSummary();
        return this.summary;
    }
    setSummary(in_summary) {
        this.summary = summary;
    }
    getRegion(index) {
        this.getRegions()[index];
    }
}

export default StructureAlignmentBlock;