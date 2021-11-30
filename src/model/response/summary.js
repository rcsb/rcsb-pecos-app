import AllignmentScore from "./score";

class AlignmentSummary {
    scores;
    n_aln_residue_pairs;
    n_modeled_residues;
    seq_aln_len;
    aln_coverage;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return undefined; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
        this.scores = obj.scores && obj.scores.map(s => new AllignmentScore(s));
    }

    getScores() {
        if (!this.scores) this.scores = [];
        return this.scores;
    }
    setScores(in_scores) {
        this.scores = in_scores;
    }
    getNAlnResiduePairs() {
        return this.n_aln_residue_pairs;
    }
    setNAlnResiduePairs(in_n_aln_residue_pairs) {
        this.n_aln_residue_pairs = in_n_aln_residue_pairs;
    }
    getNModeledResidues() {
        return this.n_modeled_residues;
    }
    setNModeledResidues(in_n_modeled_residues) {
        this.n_modeled_residues = in_n_modeled_residues;
    }
    getSeqAlnLen() {
        return this.seq_aln_len;
    }
    setSeqAlnLen(in_seq_aln_len) {
        this.seq_aln_len = in_seq_aln_len;
    }
    getAlnCoverage() {
        return this.aln_coverage;
    }
    setAlnCoverage(in_aln_coverage) {
        this.aln_coverage = in_aln_coverage;
    }
}

export default AlignmentSummary;