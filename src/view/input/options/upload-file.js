import React from 'react';

import ChainID from './components/inp-chain-id';
import ResidueID from './components/inp-resid-id';
import FileUpload from './components/inp-file-upload';
import InputOptionsEnum from '../../../model/enum/enum-input-options';

const type = InputOptionsEnum.FILE_UPLOAD;

export default function UploadFile({ ctx, index }) {
    const file = ctx.getFile(index);
    const asym_id = ctx.getAsymId(index, type);
    const beg_seq_id = ctx.getBegSeqId(index, type);
    const end_seq_id = ctx.getEndSeqId(index, type);

    const disable = !file;
    return (
        <>
            <FileUpload
                value={file || ''}
                onFileChange={(e) => ctx.updateFile(e, index)}
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
                value={end_seq_id || ''}
                disabled={disable}
                onValueChange={(v) => ctx.updateEndSeqId(v, index, type)}
            />
        </>
    );
}
