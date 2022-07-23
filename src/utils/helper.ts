/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';
import { Dispatch, SetStateAction, useEffect } from 'react';

import {
    StructureEntry,
    StructureFileUpload,
    StructureWebLink
} from '../auto/alignment/alignment-request';
import { Structure } from './request';

// STRUCTURE

export type StructureActions <T> = [
    (v: StructureEntry) => T,
    (v: StructureWebLink) => T,
    (v: StructureFileUpload) => T
];

export function applyToStructure<T>(data: Structure, options: StructureActions<T>) {
    if ('entry_id' in data) return options[0](data);
    else if ('url' in data) return options[1](data);
    else if ('format' in data) return options[2](data);
    else throw new Error('Unsupported structure type: [ ' + JSON.stringify(data) + ' ]');
}

export function isEntry(s: Structure): s is StructureEntry {
    return 'entry_id' in s;
}

// COMMON

export function deepEqual(a: any, b: any) {
    // from https://github.com/epoberezkin/fast-deep-equal MIT
    if (a === b) return true;

    const arrA = Array.isArray(a);
    const arrB = Array.isArray(b);

    if (arrA && arrB) {
        if (a.length !== b.length) return false;
        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false;
        }
        return true;
    }

    if (arrA !== arrB) return false;

    if (a && b && typeof a === 'object' && typeof b === 'object') {
        const keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length) return false;

        const dateA = a instanceof Date;
        const dateB = b instanceof Date;
        if (dateA && dateB) return a.getTime() === b.getTime();
        if (dateA !== dateB) return false;

        const regexpA = a instanceof RegExp;
        const regexpB = b instanceof RegExp;
        if (regexpA && regexpB) return a.toString() === b.toString();
        if (regexpA !== regexpB) return false;

        for (let i = 0; i < keys.length; i++) {
            if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;
        }

        for (let i = 0; i < keys.length; i++) {
            if (!deepEqual(a[keys[i]], b[keys[i]])) return false;
        }
        return true;
    }
    return false;
}

export function useObservable<T>(observable: Subject<T>, setter: Dispatch<SetStateAction<T>>) {
    useEffect(() => {
        const subscription = observable.subscribe(nextEv => {
            setter(nextEv);
        });
        return () => subscription.unsubscribe();
    }, []);
}

export function memoizeOneArgAsync(this: any, f: (arg: any) => any) {
    const cache = new Map<any, any>();
    return async function (arg: any) {
        if (cache.has(arg)) {
            return cache.get(arg);
        } else {
            const value = await f(arg);
            cache.set(arg, value);
            return value;
        }
    };
}

/**
 * Merges overlapping intervals from provided list:
 *  [[1,2], [3,6], [4,8]] -> [[1,2], [3,8]]
 *
 * @param intervals list of intervals with [begin, end] positions
 * @returns non-overlapping list of intervals
 */
export function mergeIntervals(intervals: number[][]) {
    if (intervals.length < 2) return intervals;
    intervals.sort((a, b) => a[0] - b[0]);
    const result = [];
    let previous = intervals[0];
    for (let i = 1; i < intervals.length; i += 1) {
        if (previous[1] >= intervals[i][0]) {
            previous = [previous[0], Math.max(previous[1], intervals[i][1])];
        } else {
            result.push(previous);
            previous = intervals[i];
        }
    }
    result.push(previous);
    return result;
}