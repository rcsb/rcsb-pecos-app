import React, { useState } from 'react';
import Popup from 'react-popup';

import CopyIcon from '../../icons/copy';
import Warning from '../../icons/warning';

import StructureURL from '../../../model/response/structure-url';
import { encodeJsonToBase64 } from '../../../utils/encoder';
import { RESPONSE_BODY_PARAM, ENCODING_PARAM } from '../../../utils/constants';

export default function CopyResultsLink({ response }) {
    const [copied, setCopied] = useState(false);

    function isBookmarkable() {
        const results = response.getResults();
        for (const alignment of results) {
            for (const s of alignment.getStructures()) {
                if (s instanceof StructureURL) return false;
            }
        }
        return true;
    }

    function createLink() {
        const baseURL = window.location.href.split('?')[0];
        const encodeParam = `${ENCODING_PARAM}=true`;
        const bodyParam = `${RESPONSE_BODY_PARAM}=${encodeURIComponent(encodeJsonToBase64(response))}`;
        return baseURL + '?' + bodyParam + '&' + encodeParam;
    }

    async function fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.top = '0';
        textarea.style.left = '0';
        textarea.style.position = 'fixed';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    async function copyLinkToClipboardAsync(text) {
        if (!navigator.clipboard) {
            return fallbackCopyToClipboard(text);
        } else {
            return navigator.clipboard.writeText(text);
        }
    }

    function copyLinkToClipboard() {
        const text = createLink();
        copyLinkToClipboardAsync(text)
            .then(() => showSuccessMessage())
            .catch((err) => {
                const element = document.getElementById('copy-link-button');
                Popup.plugins().popover(text, element);
                console.error(err);
            });
    }

    function showSuccessMessage() {
        setCopied(true);
        setTimeout(() => setCopied(false), 800);
    }

    return (
        isBookmarkable() &&
        <span title='This is an experimental feature and stored URLs might not be openable in a future version'>
            {
                copied &&
            <button id='copy-link-button' className='btn-action btn-submit'>
                Link Copied!
            </button>
            }
            {
                !copied &&
            <button id='copy-link-button' className='btn-action btn-submit' onClick={() => copyLinkToClipboard()}>
                <CopyIcon/> Copy Link <Warning/>
            </button>
            }
        </span>
    );
}
