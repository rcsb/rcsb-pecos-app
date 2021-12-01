import React from 'react';
import PaperClipIcon from '../../../icons/paper-clip';

export default function UploadedFile({ name }) {
    return (
        <div>
            <span className='icon-container'>{name}</span>
            <PaperClipIcon className='icon-container' />
        </div>
    );
}
