import StructureURL from "./structure-url";
import StructureEntry from "../request/structure-entry";
import StructureAlignmentBlock from "./alignment-block";
import AlignmentSummary from "./summary";
import SequenceAlignment from "./sequence-alignment";

class AlignmentSolution {
    summary;
    structures;
    structure_alignment;
    sequence_alignment;
    
    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return undefined; }

    _constructFromObject(obj) {
        this.structures = obj.structures.map(s => {
            if (s.entry_id) return new StructureEntry(s);
            else  return new StructureURL(s);
        });
        this.summary = new AlignmentSummary(obj.summary);
        this.sequence_alignment = obj.sequence_alignment && obj.sequence_alignment.map(a => new SequenceAlignment(a));
        this.structure_alignment = obj.structure_alignment && obj.structure_alignment.map(b => new StructureAlignmentBlock(b));
    }

    getStructures() {
        return this.structures;
    }
    getStructure(memberIdx) {
        return this.getStructures()[memberIdx];
    }
    getStructureAlignment() {
        if (!this.structure_alignment) this.structure_alignment = [];
        return this.structure_alignment;
    }
    getStructureAlignmentBlock(blockIdx) {
        return this.getStructureAlignment()[blockIdx];
    }
    getSequenceAlignment() {
        if (!this.sequence_alignment) this.sequence_alignment = [];
        return this.sequence_alignment;
    }
    getSummary() {
        if (!this.summary) this.summary = new AlignmentSummary();
        return this.summary;
    }
    structuresNum() {
        return this.getStructures().length;
    }
    blocksNum() {
        return this.getStructureAlignment().length;
    }
    isFlexible(){
        return this.blocksNum() > 1;
    }
}

export default AlignmentSolution;