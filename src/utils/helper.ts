/* eslint-disable @typescript-eslint/no-explicit-any */
import { Subject } from 'rxjs';
import { Dispatch, SetStateAction, useEffect } from 'react';

import {
    StructureEntry,
    StructureFileUpload,
    StructureWebLink
} from '../auto/alignment/alignment-request';
import { QueryRequest, Structure } from './request';
import { StructureAlignmentResponse, StructureAlignmentMetadata } from '../auto/alignment/alignment-response';
import { requestUrlParam, responseUrlParam, encodingUrlParam } from './constants';
import { encodeJsonToBase64 } from './encoding';

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

export function isUrl(s: Structure): s is StructureWebLink {
    return 'url' in s;
}

export function isUploadedFile(s: Structure): s is StructureFileUpload {
    return !('url' in s) && ('format' in s);
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

interface IObject {
    [key: string]: any;
}

/**
 * @description Method to check if an item is an object. Date and Function are considered
 * an object, so if you need to exclude those, please update the method accordingly.
 * @param item - The item that needs to be checked
 * @return {Boolean} Whether or not @item is an object
 */
const isObject = (item: any): boolean => {
    return (item === Object(item) && !Array.isArray(item));
};

/**
 * @description Method to perform a deep merge of objects
 * @param {Object} target - The targeted object that needs to be merged with the supplied @sources
 * @param {Array<Object>} sources - The source(s) that will be used to update the @target object
 * @return {Object} The final merged object
 */
export const deepMerge = (target: object, ...sources: Array<object>): object => {
    // return the target if no sources passed
    if (!sources.length) {
        return target;
    }
    const result: IObject = target;
    if (isObject(result)) {
        const len: number = sources.length;
        for (let i = 0; i < len; i += 1) {
            const elm: any = sources[i];
            if (isObject(elm)) {
                for (const key in elm) {
                    // eslint-disable-next-line no-prototype-builtins
                    if (elm.hasOwnProperty(key)) {
                        if (isObject(elm[key])) {
                            if (!result[key] || !isObject(result[key])) {
                                result[key] = {};
                            }
                            deepMerge(result[key], elm[key]);
                        } else {
                            if (Array.isArray(result[key]) && Array.isArray(elm[key])) {
                                // concatenate the two arrays and remove any duplicate primitive values
                                result[key] = Array.from(new Set(result[key].concat(elm[key])));
                            } else {
                                result[key] = elm[key];
                            }
                        }
                    }
                }
            }
        }
    }
    return result;
};

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

export function trimTrailingChars(value: string, char: string) {
    const regExp = new RegExp(char + '+$');
    return value.replace(regExp, '');
}

export function buildError(uuid: string, msg: string): StructureAlignmentResponse {
    return {
        info: {
            uuid: uuid,
            status: 'ERROR',
            message: msg
        }
    };
}

export type TransformationType = 'flexible' | 'rigid';

export function getTransformationType(meta: StructureAlignmentMetadata): TransformationType {
    return (meta.alignment_method === 'fatcat-flexible' || meta.alignment_method === 'ce-cp')
        ? 'flexible'
        : 'rigid';
}

/**
 * Results that contain URL require volatile API instance state and they should not
 * be offered as bookmarkable
 *
 * @returns 'true' if all requested structures are part of the public repository
 */
export function isBookmarkableResult(apiResponse: StructureAlignmentResponse | undefined) {
    if (!apiResponse)
        return false;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const alignment of apiResponse.results!) {
        for (const s of alignment.structures) {
            if (('format' in s) && !('url' in s))
                return false;
        }
    }
    return true;
}

export function createBookmarkableResultsURL(apiRequestState: QueryRequest, apiResponseState: StructureAlignmentResponse | undefined) {
    const baseURL = window.location.href.split('?')[0];
    const b64Request = encodeJsonToBase64(apiRequestState);
    const requestParam = `${requestUrlParam}=${encodeURIComponent(b64Request)}`;
    const b64Response = encodeJsonToBase64(apiResponseState);
    const responseParam = `${responseUrlParam}=${encodeURIComponent(b64Response)}`;
    const encodeParam = `${encodingUrlParam}=true`;
    return baseURL + '?' + requestParam + '&' + responseParam + '&' + encodeParam;
}