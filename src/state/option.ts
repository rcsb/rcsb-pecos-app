import clonedeep from 'lodash.clonedeep';

import { Subject } from 'rxjs';

export type StructureInputOption = 'rcsb-entry' | 'rcsb-uniprot' | 'file-url' | 'file-upload' | 'alphafold-db' | 'esm-atlas';

export class OptionState {

    private _state: StructureInputOption[];
    private readonly _subject: Subject<StructureInputOption[]>;

    constructor() {
        this._subject = new Subject();
        this._state = ['rcsb-entry', 'rcsb-entry'];
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

    reset(options: StructureInputOption[]) {
        this._subject.next(options);
    }

    push(value: StructureInputOption, index: number) {
        const next = [
            ...this._state.slice(0, index),
            value,
            ...this._state.slice(index + 1)
        ];
        this._subject.next(next);
    }

    remove(index: number) {
        const next = [...this._state.slice(0, index), ...this._state.slice(index + 1)];
        this._subject.next(next);
    }

    clear() {
        this._state = ['rcsb-entry', 'rcsb-entry'];
        this._subject.next(this._state);
    }
}