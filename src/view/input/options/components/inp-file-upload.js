import React from 'react';
import Upload from 'rc-upload';

import UploadIcon from '../../../icons/upload';
import UploadedFile from './inp-uploaded-file';
import ResponseEventObservable from '../../../../observable/response-observable';

export default class FileUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: this.props.value
        };
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.file !== nextProps.value) {
            return {
                file: nextProps.value
            };
        }
        // Return null to indicate no change to state.
        return null;
    }

    render() {
        const nonempty = this.state.file;
        const props = {
            onRemove: () => {
                this.setState({ file: null });
                this.props.onFileChange(null);
            },
            beforeUpload: (file) => {
                const name = file.name.toLowerCase();
                if (
                    name.endsWith('.cif') ||
          name.endsWith('.cif.gz') ||
          name.endsWith('.bcif') ||
          name.endsWith('.bcif.gz') ||
          name.endsWith('.ent') ||
          name.endsWith('.ent.gz') ||
          name.endsWith('.pdb') ||
          name.endsWith('.pdb.gz')
                ) {
                    this.setState({ file: file });
                    this.props.onFileChange(file);
                } else {
                    ResponseEventObservable.setError(
                        'Excepted formats: .cif, .cif.gz, .bcif, .bcif.gz, .ent, .pdb, .ent.gz, .pdb.gz'
                    );
                }
                return false;
            }
        };

        return (
            <>
                {!nonempty && (
                    <Upload style={{ outline: 'none' }} {...props}>
                        <button className='upload-btn'>
                            <UploadIcon />
                            <span className='upload-btn-label'>Upload File</span>
                        </button>
                    </Upload>
                )}
                {nonempty && (
                    <UploadedFile
                        name={this.state.file.name}
                        className='upload-item-container'
                    />
                )}
            </>
        );
    }
}
