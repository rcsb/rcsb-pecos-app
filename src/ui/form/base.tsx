import { useState, useEffect } from 'react';
import classNames from 'classnames';

import {
    InputBoxControl,
    SelectorControl,
    FileUploadControl,
    UploadedFile,
    AutosuggestControl
} from '../controls/controls-input';

import { StructureFileFormat } from '../../auto/alignment/alignment-request';
import { createInstanceLabel, isValidEntryId } from '../../utils/identifier';

type BaseProps = {
    value?: string | number,
    label?: string,
    onChange: (value: string) => void,
    isDisabled?: boolean
}

type FileUploadProps = {
    value: File
    onUpdate: (value: File) => void;
    onError: (mesage: string) => void;
}

export function EntryInputComponent(props: BaseProps & {
    suggestFn: (v: string) => Promise<string[]>
}) {
    return <AutosuggestControl
        value={String(props.value)}
        label='Entry ID'
        onChange={props.onChange}
        suggestHandler={props.suggestFn}
        className={classNames('inp', 'inp-entry')}
    />;
}

export function AsymSelectorComponent(props: BaseProps & {
    entry_id: string;
    fetchFn: (v: string) => Promise<string[][]>;
    onOptsAvailable: (value: string) => void;
}) {
    const [options, setOptions] = useState<string[][]>([]);
    useEffect(() => { getAsymOptions(); }, [props.entry_id]);

    const getAsymOptions = async () => {
        const opts: string[][] = [];
        if (isValidEntryId(props.entry_id)) {
            const values = await props.fetchFn(props.entry_id);
            if (values.length > 0) {
                for (const val of values) {
                    const asymId = val[0];
                    const authAsymId = val[1];
                    const label = createInstanceLabel(asymId, authAsymId);
                    opts.push([asymId, label]);
                }
                props.onOptsAvailable(opts[0][0]);
            }
        }
        setOptions(opts);
    };

    if (options.length > 0) {
        return <SelectorControl
            value={String(props.value)}
            options={options}
            isDisabled={props.isDisabled}
            onChange={props.onChange}
            className='inp-select'
        />;
    } else {
        return <AsymInputComponent
            value=''
            isDisabled={true}
            onChange={props.onChange}
        />;
    }
}

export function AsymInputComponent(props: BaseProps) {
    return <InputBoxControl
        type='text'
        value={props.value}
        label='Chain ID'
        isDisabled={props.isDisabled}
        onChange={props.onChange}
        style={{ width: '70px' }}
        className='inp'
    />;
}

export function ResidueInputComponent(props: BaseProps) {
    return <InputBoxControl
        type='number'
        value={props.value}
        label={props.label}
        isDisabled={props.isDisabled}
        onChange={props.onChange}
        className={classNames('inp', 'inp-num')}
    />;

}

export function FormatInputComponent(props: BaseProps) {
    const options: Array<[StructureFileFormat, string]> = [
        ['mmcif', 'mmCIF'],
        ['pdb', 'PDB']
    ];
    return <SelectorControl
        value={String(props.value)}
        options={options}
        onChange={props.onChange}
        className='inp-format'
    />;
}

export function WebLinkInputComponent(props: BaseProps) {
    return <InputBoxControl
        type='text'
        value={props.value}
        onChange={props.onChange}
        label='https://'
        className={classNames('inp', 'inp-link')}
    />;
}

export function FileInputComponent(props: FileUploadProps) {
    if (!props.value) {
        return <FileUploadControl
            acceptFormats={['cif', 'bcif', 'pdb', 'ent']}
            allowCompressed={true}
            label='Upload File'
            onChange={props.onUpdate}
            onValidationError={props.onError}
            className='btn-upload'
        />;
    } else {
        return <UploadedFile
            name={props.value.name}
        />;
    }
}