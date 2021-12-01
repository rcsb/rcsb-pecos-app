import AlignmentJobStatusEnum from '../enum/enum-response-status';

class QueryResponseInfo {
    uuid;
    status;
    message;

    constructor(obj) {
        if (obj) this._constructFromObject(obj);
        else this._constructEmpty();
    }

    _constructEmpty() { return; }

    _constructFromObject(obj) {
        obj && Object.assign(this, obj);
    }

    getUuid() {
        return this.uuid;
    }
    setUuid(in_uuid) {
        this.uuid = in_uuid;
    }

    getStatus() {
        return this.status;
    }
    setStatus(in_status) {
        this.status = in_status;
    }

    getMessage() {
        return this.message;
    }
    setMessage(in_message) {
        this.message = in_message;
    }

    isComplete() {
        return this.status === AlignmentJobStatusEnum.COMPLETE.value;
    }
    isRunning() {
        return this.status === AlignmentJobStatusEnum.RUNNING.value;
    }
    isError() {
        return this.status === AlignmentJobStatusEnum.ERROR.value;
    }
}

export default QueryResponseInfo;