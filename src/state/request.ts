import clonedeep from 'lodash.clonedeep';

import { Subject } from 'rxjs';
import { QueryRequest } from '../utils/request';

export class RequestState {

    private _state: QueryRequest;
    private readonly _subject: Subject<QueryRequest>;

    constructor() {
        this._subject = new Subject();
        this._state = new QueryRequest();
    }

    get state() {
        return this._state;
    }

    get subject() {
        return this._subject;
    }

    copy() {
        return clonedeep(this.state);
    }

    push(value: QueryRequest) {
        this._state = value;
        this._subject.next(this._state);
    }

    clear() {
        this.push(new QueryRequest());
    }
}