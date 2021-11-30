import React from 'react'

import WebLink from './components/inp-web-link';
import ChainID from './components/inp-chain-id';
import ResidueID from './components/inp-resid-id';
import FormatSelection from './components/inp-format';

import InputOptionsEnum from '../../../model/enum/enum-input-options'

const type = InputOptionsEnum.WEB_LINK;

export default function PasteLink({ ctx, index }) {

    const url = ctx.getURL(index, type);
    const format = ctx.getFormat(index, type);
    const asym_id = ctx.getAsymId(index, type);
    const beg_seq_id = ctx.getBegSeqId(index, type);
    const end_seq_id = ctx.getEndSeqId(index, type);

    const disable = !url;
    return (
        <>
            <WebLink 
                value={url || ''}
                onValueChange={(v) => ctx.updateURL(v, index, type)}
            />

            <FormatSelection 
                value={format || ''}
                index={index}
                type={type}
                onValueChange={(v) => ctx.updateFormat(v, index, type)}
            />

            <ChainID
                value={asym_id || ''}
                disabled={disable}
                onValueChange={(v) => ctx.updateAsymId(v, index, type)}
            />

            <ResidueID 
                label='Beg'
                value={beg_seq_id || ''}
                disabled={disable}
                onValueChange={(v) => ctx.updateBegSeqId(v, index, type)}
            />

            <ResidueID 
                label='End'
                value={end_seq_id}
                disabled={disable}
                onValueChange={(v) => ctx.updateEndSeqId(v, index, type)}
            />
        </>
    )
}