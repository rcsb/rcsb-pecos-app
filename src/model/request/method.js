import { ALIGNMENT_METHOD_DEFAULT } from '../enum/enum-method-options';

class Method {
    name;
    parameters;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() {
        this.name = ALIGNMENT_METHOD_DEFAULT.value;
     }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    setMethodName(name) {
        this.name = name;
    }
    getMethodName() {
        return this.name;
    }
    getParameters() {
        if (!this.parameters) this.parameters = {};
        return this.parameters;
    }
    setParameters(parameters) {
        this.parameters=parameters;
    }
    setMethodParameter(paramName, paramValue) {
        this.getParameters()[paramName] = paramValue;
    }
    getMethodParameter(paramName) {
        return this.getParameters()[paramName];
    }
}

export default Method;