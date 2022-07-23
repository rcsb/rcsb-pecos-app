import { Subject } from 'rxjs';
import { StructureAlignmentResponse } from '../auto/alignment/alignment-response';

export class ResponseState {
    private _state?: StructureAlignmentResponse;
    private readonly _subject: Subject<StructureAlignmentResponse | undefined>;
    constructor() {
        this._subject = new Subject();
    }
    get state() {
        return this._state;
    }
    get subject() {
        return this._subject;
    }
    push(value: StructureAlignmentResponse) {
        this._state = value;
        this._subject.next(this._state);
    }
}