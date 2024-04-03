import { useState } from 'react';
import Dropdown from 'rc-dropdown';
import Menu, { Divider, Item as MenuItem } from 'rc-menu';

import { encodeJsonToBase64 } from '../../utils/encoding';
import { ApplicationContext, DownloadOptions } from '../../context';
import { CopySvg, Icon, SolidArrowDownSvg, DownloadSvg } from '../icons';
import { encodingUrlParam, requestUrlParam, responseUrlParam } from '../../utils/constants';
import { exportSequenceAlignment, exportTransformations } from '../../utils/download';
import { MenuInfo, MenuClickEventHandler } from 'rc-menu/es/interface';

const style: React.CSSProperties = { width: '150px' };

type DownloadOptionsKeys = Exclude<DownloadOptions, undefined>
const downloadOptions = new Map<DownloadOptionsKeys, string>([
    ['structure', 'Superposed Structures (mmCIF)'],
    ['sequence', 'Sequence Alignment (FASTA)'],
    ['transform', 'Transformation Matrices (JSON)'],
    ['all', 'Download All']
]);

export function DownloadAssetsComponent(props: { ctx: ApplicationContext }) {

    const [isVisible, setVisiblity] = useState(false);

    const selectHandler: MenuClickEventHandler = (info: MenuInfo) => {
        setVisiblity(false);
        const opt = info.key as DownloadOptionsKeys;
        if (opt === 'all' || opt === 'transform')
            exportTransformations(props.ctx.state.data.response.state?.results);
        if (opt === 'all' || opt === 'sequence')
            exportSequenceAlignment(props.ctx.state.data.response.state?.results);
        if (opt === 'all' || opt === 'structure')
            props.ctx.state.events.download.next(info.key as DownloadOptionsKeys);
    };

    const menuList = () => {
        const menu = [];
        for (const k of downloadOptions.keys()) {
            if (k === 'all')
                menu.push(<Divider key={downloadOptions.size + 1} />);
            menu.push(
                <MenuItem key={k}>
                    <span>{downloadOptions.get(k)}</span>
                </MenuItem>
            );
        }
        return menu;
    };

    const menu = (
        <Menu className='files-download-menu'
            onClick={selectHandler}
        >
            {menuList()}
        </Menu>
    );

    return (
        <Dropdown
            trigger={['click']}
            visible={isVisible}
            onVisibleChange={setVisiblity}
            overlay={menu}
            animation='slide-up' >
            <button className='btn-action btn-submit' style={style}>
                <Icon svg={DownloadSvg} className='download-icon'/>
                    Export
                <Icon svg={() => SolidArrowDownSvg('45', '20', '-5 3 20 20')} className='arrow-down-icon'/>
            </button>
        </Dropdown>
    );
}

export function CopyResultsComponent(props: { ctx: ApplicationContext }) {

    const [copied, setCopied] = useState(false);

    /**
     * Results that contain URL require volatile API instance state and they should not
     * be offered as bookmarkable
     *
     * @returns 'true' if all requested structures are part of the public repository
     */
    function isBookmarkable() {
        const results = props.ctx.state.data.response.state?.results;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const alignment of results!) {
            for (const s of alignment.structures) {
                if (('format' in s) && !('url' in s))
                    return false;
            }
        }
        return true;
    }

    function createLink() {
        const baseURL = window.location.href.split('?')[0];
        const b64Request = encodeJsonToBase64(props.ctx.state.data.request.state);
        const requestParam = `${requestUrlParam}=${encodeURIComponent(b64Request)}`;
        const b64Response = encodeJsonToBase64(props.ctx.state.data.response.state);
        const responseParam = `${responseUrlParam}=${encodeURIComponent(b64Response)}`;
        const encodeParam = `${encodingUrlParam}=true`;
        return baseURL + '?' + requestParam + '&' + responseParam + '&' + encodeParam;
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

    async function copyLinkToClipboardAsync(text: string) {
        if (!navigator.clipboard) {
            return fallbackCopyToClipboard(text);
        } else {
            return navigator.clipboard.writeText(text);
        }
    }

    function willExpire() {
        const results = props.ctx.state.data.response.state?.results;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (const alignment of results!) {
            for (const s of alignment.structures) {
                if (('url' in s) && props.ctx.files().isServiceUrl(s.url))
                    return true;
            }
        }
        return false;
    }

    function copyLinkToClipboard() {

        const text = createLink();
        copyLinkToClipboardAsync(text)
            .then(() => {
                if (willExpire()) {
                    alert('⚠️ This link contains URLs to structure files hosted by the RCSB PDB file upload service. These URLs will expire after a certain period, after which the structures will not be available for visualization. If the link has expired, consider generating a new one');
                }
                setCopied(true);
                setTimeout(() => setCopied(false), 800);
            })
            .catch((err) => {
                alert(err);
            });
    }

    return (<>
        {isBookmarkable() &&
            <span title='This is an experimental feature and stored URLs might not be openable in a future version'>
                {copied &&
                <button id='copy-link-button' className='btn-action btn-submit' style={style}>
                    Link Copied!
                </button>
                }
                {!copied &&
                <button id='copy-link-button' className='btn-action btn-submit' style={style}
                    onClick={() => copyLinkToClipboard()}>
                    <Icon svg={CopySvg} className='copy-icon' />
                        Copy Link
                </button>
                }
            </span>
        }</>
    );
}