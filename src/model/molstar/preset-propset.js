import PresetSelection from './preset-selection';
import PresetColorProp from './preset-color-prop';
import { clean } from '../../utils/common';

class PropsetPreset {
    kind;
    selection;
    representation;
    
    constructor() {
        this.kind='prop-set';
    }

    getSelection() {
        if (!this.selection)this.selection=[];
        return this.selection;
    }
    addAsymSelection(matrix, asym) {
        const polymers = this.getSelection().filter(s => s.getlLabelAsymId() === asym);
        if (polymers.length === 0) { // add new
            const sele = new PresetSelection();
            sele.setMatrix(matrix);
            sele.addRange(asym);
            this.getSelection().push(sele);
        } 
    }
    addSelection(matrix, asym, beg, end) {
        if (beg) {
            const sele = new PresetSelection();
            sele.setMatrix(matrix);
            sele.addRange(asym, beg, end);
            this.getSelection().push(sele);
        } else {
            this.addAsymSelection(matrix, asym);
        }
        
    }
    getRepresentation() {
        if (!this.representation)this.representation=[];
        return this.representation;
    }
    addRepresentation(color, asym, beg, end) {
        const repr = new PresetColorProp();
        repr.setValue(color);
        repr.addPositions(asym, beg, end);
        this.getRepresentation().push(repr);
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

export default PropsetPreset;