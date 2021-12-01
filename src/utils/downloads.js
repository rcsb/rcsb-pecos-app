export function getFormattedTime() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const h = today.getHours();
    const mi = today.getMinutes();
    const s = today.getSeconds();
    return y + '-' + m + '-' + d + '-' + h + '-' + mi + '-' + s;
}

function openUrl(url) {
    const opened = window.open(url, '_blank');
    if (!opened) {
        window.location.href = url;
    }
}

function click(node) {
    try {
        node.dispatchEvent(new MouseEvent('click'));
    } catch (e) {
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(
            'click',
            true,
            true,
            window,
            0,
            0,
            0,
            80,
            20,
            false,
            false,
            false,
            false,
            0,
            null
        );
        node.dispatchEvent(evt);
    }
}

function download(data, downloadName = 'download') {
    if (!data) return;

    if ('download' in HTMLAnchorElement.prototype) {
        const a = document.createElement('a');
        a.download = downloadName;
        a.rel = 'noopener';

        if (typeof data === 'string') {
            a.href = data;
            click(a);
        } else {
            a.href = URL.createObjectURL(data);
            setTimeout(() => URL.revokeObjectURL(a.href), 4e4); // 40s
            setTimeout(() => click(a));
        }
    } else if (typeof navigator !== 'undefined' && navigator.msSaveOrOpenBlob) {
    // native saveAs in IE 10+
        navigator.msSaveOrOpenBlob(data, downloadName);
    } else {
        const ua = window.navigator.userAgent;
        const isSafari = /Safari/i.test(ua);
        const isChromeIos = /CriOS\/[\d]+/.test(ua);

        const open = (str) => {
            openUrl(
                isChromeIos ? str : str.replace(/^data:[^;]*;/, 'data:attachment/file;')
            );
        };

        if ((isSafari || isChromeIos) && FileReader) {
            if (data instanceof Blob) {
                // no downloading of blob urls in Safari
                const reader = new FileReader();
                reader.onloadend = () => open(reader.result);
                reader.readAsDataURL(data);
            } else {
                open(data);
            }
        } else {
            const url = URL.createObjectURL(data);
            location.href = url;
            setTimeout(() => URL.revokeObjectURL(url), 4e4); // 40s
        }
    }
}

export async function triggerDownload(data, filename) {
    const blob = new Blob([data], { type: 'text/plain' });
    download(blob, filename);
}
