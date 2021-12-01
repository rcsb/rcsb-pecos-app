import React from 'react';

export default function DownloadIcon() {
    return (
        <span role="img" aria-label="download" className="download-icon">
            <svg id="download-files" viewBox="0 0 22 22" focusable="false" data-icon="download"
                strokeWidth='0.1px' width="1em" height="1em" fill="currentColor">
                <path d="M19 12v7H5v-7H3v9h18v-9h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2v9.67z" />
            </svg>
        </span>
    );
}
