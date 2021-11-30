import QueryOptions from './query-options';
import QueryContext from './query-context';

class Query {
    options;
    context;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { }

    _constructFromObject(obj) {
        this.options = new QueryOptions(obj.options);
        this.context = new QueryContext(obj.context); 
    }

    setOptions(options) {
        this.options = options;
    }
    getOptions() {
        if (!this.options) this.options = new QueryOptions();
        return this.options;
    }
    setContext(context) {
        this.context = context;
    }
    getContext() {
        if (!this.context) this.context = new QueryContext();
        return this.context;
    }
    setDefaultOptions(requestSequenceData) {
        this.getOptions().setReturnSequenceData(requestSequenceData);
    }
    toString() {
        return JSON.stringify(this);
    }
    toObject() {
        const json = JSON.parse(this.toString());
        return json;
    }
}

export default Query;