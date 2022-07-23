/* eslint-disable @typescript-eslint/no-explicit-any */
import pako from 'pako';

function bytesToBase64(bytes: Uint8Array) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function encodeJsonToBase64(json: any) {
    const bytes = pako.deflate(JSON.stringify(json));
    return bytesToBase64(bytes);
}

function base64ToBytes(base64: string) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function decodeBase64ToJson(base64: string) {
    const bytes = base64ToBytes(base64);
    return JSON.parse(pako.inflate(bytes, { to: 'string' }));
}