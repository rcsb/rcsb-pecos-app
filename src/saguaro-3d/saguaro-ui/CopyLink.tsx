import React, { useState } from 'react';
import { ApplicationContext } from '../../context';
import { encodingUrlParam, responseUrlParam } from '../../utils/constants';
import { encodeJsonToBase64 } from '../../utils/encoding';
import { CopySvg, Icon, WarningSvg } from '../../ui/icons';

export class CopyLink extends React.Component <{ ctx: ApplicationContext; }, {copied: boolean;}> {

    readonly state = {
        copied: false
    };
    render() {
        return (<>
            {isBookmarkable(this.props) &&
                    <div style={{cursor: 'pointer'}} title='This is an experimental feature and stored URLs might not be openable in a future version'>
                        {this.state.copied &&
                        <div id='copy-link-button'>
                            LINK COPIED
                        </div>
                        }
                        {!this.state.copied &&
                            <div id='copy-link-button' onClick={() => this.copyLinkToClipboard()}>
                                COPY LINK
                            </div>
                        }
                    </div>
            }</>
        );
    }

    private copyLinkToClipboard() {
        const text = createLink(this.props);
        copyLinkToClipboardAsync(text)
            .then(() => {
                this.setState({ copied: true }, ()=>{
                    setTimeout(() => this.setState({ copied: false }), 1500);
                });
            })
            .catch((err) => {
                alert(err);
            });
    }
}

function isBookmarkable(props: { ctx: ApplicationContext }) {
    const results = props.ctx.state.data.response.state?.results;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    for (const alignment of results!) {
        for (const s of alignment.structures) {
            if ('url' in s) return false;
        }
    }
    return true;
}

function createLink(props: { ctx: ApplicationContext }) {
    const baseURL = window.location.href.split('?')[0];
    const encodeParam = `${encodingUrlParam}=true`;
    const b64 = encodeJsonToBase64(props.ctx.state.data.response.state);
    const bodyParam = `${responseUrlParam}=${encodeURIComponent(b64)}`;
    return baseURL + '?' + bodyParam + '&' + encodeParam;
}

async function copyLinkToClipboardAsync(text: string) {
    if (!navigator.clipboard) {
        return fallbackCopyToClipboard(text);
    } else {
        return navigator.clipboard.writeText(text);
    }
}

async function fallbackCopyToClipboard(text: string) {
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

const style: React.CSSProperties = { width: '150px' };
