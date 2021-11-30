import pako from 'pako'

function base64ToBytes( base64 ) {
    const binaryString =  window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array( len );
    for (var i = 0; i < len; i++)        {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export function decodeBase64ToJson(base64) {
    const bytes = base64ToBytes(base64)
    return JSON.parse(pako.inflate(bytes, { to: 'string' }))
}