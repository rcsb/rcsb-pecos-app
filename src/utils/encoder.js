import pako from 'pako';

function bytesToBase64(bytes) {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export function encodeJsonToBase64(json) {
    // returns Uint8Array
    const bytes = pako.deflate(JSON.stringify(json));
    return bytesToBase64(bytes);
}
