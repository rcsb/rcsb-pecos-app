/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface SuggesterResponse {
    took?: number;
    suggestions: {
        [k: string]: Suggestion[];
    };
    [k: string]: unknown;
}
export interface Suggestion {
    text: string;
    score: number;
    contexts?: {
        [k: string]: string[];
    };
    [k: string]: unknown;
}