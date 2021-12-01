import QueryResponseInfo from './response-info';
import AlignmentMetadata from './alignment-meta';
import AlignmentSolution from './alignment';

class QueryResponse {
    info;
    meta;
    results;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return; }

    _constructFromObject(obj) {
        this.info = new QueryResponseInfo(obj.info);
        this.meta = new AlignmentMetadata(obj.meta);
        this.results = obj.results && obj.results.map(r => new AlignmentSolution(r));
    }

    getInfo() {
        if (!this.info) this.info = new QueryResponseInfo();
        return this.info;
    }
    setInfo(info) {
        this.info = info;
    }
    getMeta() {
        if (!this.meta) this.meta = new AlignmentMetadata();
        return this.meta;
    }
    setMeta(meta) {
        this.meta = meta;
    }
    getResults() {
        if (!this.results) this.results = [];
        return this.results;
    }
    setResults(results) {
        this.results = results;
    }
    isComplete() {
        return this.getInfo().isComplete();
    }
    isRunning() {
        return this.getInfo().isRunning();
    }
    isError() {
        return this.getInfo().isError();
    }
    toString() {
        return JSON.stringify(this);
    }
}

export default QueryResponse;