import PropsetPreset from './preset-propset';
import { clean } from '../../utils/common';

class EntryPreset {
    pdbId;
    matrix;
    props;

    constructor() {}

    getPdbId() {
        return this.pdbId;
    }
    setPdbId(pdbId) {
        this.pdbId=pdbId;
    }
    getMatrix() {
        return this.matrix;
    }
    setMatrix(matrix) {
        this.matrix=matrix;
    }
    setProps(props) {
        this.props=props;
    }
    getProps() {
        if (!this.props) this.props = new PropsetPreset();
        return this.props;
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

export default EntryPreset;