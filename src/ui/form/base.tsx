import { useState, useEffect } from 'react';
import classNames from 'classnames';

import {
    InputBoxControl,
    SelectorControl,
    FileUploadControl,
    UploadedFile,
    AutosuggestControl,
    SelectOption
} from '../controls/controls-input';

import { createInstanceLabel, isValidEntryId } from '../../utils/identifier';
import { StructureFileFormat } from '../../auto/alignment/alignment-request';

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
        label={props.label}
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
    const [options, setOptions] = useState<SelectOption<string>[]>([]);
    useEffect(() => { getAsymOptions(); }, [props.entry_id]);

    const getAsymOptions = async () => {
        const opts: SelectOption<string>[] = [];
        if (isValidEntryId(props.entry_id)) {
            const values = await props.fetchFn(props.entry_id);
            if (values.length > 0) {
                for (const val of values) {
                    const asymId = val[0];
                    const authAsymId = val[1];
                    const label = createInstanceLabel(asymId, authAsymId);
                    opts.push({ label: label, value: asymId });
                }
                const current = props.value || opts[0].value;
                props.onOptsAvailable(String(current));
            }
        }
        setOptions(opts);
    };

    if (options.length > 0) {
        return <SelectorControl
            value={String(props.value)}
            placeholder='Chain ID'
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
    const options: SelectOption<StructureFileFormat>[] = [
        {
            label: 'mmCIF',
            value: 'mmcif'
        },
        {
            label: 'PDB',
            value: 'pdb'
        }
    ];
    return <SelectorControl
        value={String(props.value)}
        placeholder='Format'
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
            allowCompressed={false}
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