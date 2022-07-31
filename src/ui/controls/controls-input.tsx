import '../skin/selector.css';
import '../skin/suggestions.css';

import { useState, CSSProperties } from 'react';
import Select, { Option } from 'rc-select';
import Upload, { UploadProps } from 'rc-upload';
import Autosuggest, { ChangeEvent, SuggestionsFetchRequestedParams } from 'react-autosuggest';
import { Icon, UploadSvg, PaperClipSvg } from '../icons';
import { isValidEntryId } from '../../utils/identifier';

type AutosuggestControlProps = {
    value: string,
    label?: string,
    suggestHandler: (value: string) => Promise<string[]>,
    onChange: (value: string) => void,
    style?: CSSProperties,
    className?: string
}

export function AutosuggestControl(props: AutosuggestControlProps) {

    const [suggestions, setSuggestions] = useState<Array<string>>([]);

    const onRenderAction = (value: string): JSX.Element => <div>{value}</div>;

    function onSelectAction(_: React.FormEvent<HTMLElement>, data: Autosuggest.SuggestionSelectedEventData<string>): void {
        const v = data.suggestion;
        if (props.value !== v) props.onChange(v);
    }

    function onChangeAction(_: React.FormEvent<HTMLElement>, change: ChangeEvent): void {
        const v = change.newValue?.trim().toUpperCase() || '';
        if (props.value !== v) {
            if (isValidEntryId(v)) setSuggestions([]);
            props.onChange(v);
        }
    }

    function onFetchAction(request: SuggestionsFetchRequestedParams): void {
        props.suggestHandler(request.value).then((values) => {
            if (values.length > 0 && !isValidEntryId(request.value)) {
                setSuggestions(values);
            } else { // clear suggestions
                setSuggestions([]);
            }
        });
    }

    const inputProps = {
        placeholder: props.label,
        value: props.value,
        className: props.className,
        onChange: onChangeAction
    };

    return <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onFetchAction}
        onSuggestionsClearRequested={() => setSuggestions([])}
        onSuggestionSelected={onSelectAction}
        getSuggestionValue={() => props.value}
        renderSuggestion={onRenderAction}
        inputProps={inputProps}
    />;
}

type InputBoxControlProps = {
    type: string,
    value?: string | number,
    label?: string,
    isDisabled?: boolean,
    onChange: (value: string) => void,
    style?: React.CSSProperties,
    className?: string
}

export function InputBoxControl(props: InputBoxControlProps) {
    return <input
        type={props.type}
        value={props.value}
        placeholder={props.label}
        disabled={props.isDisabled}
        className={props.className}
        style={props.style}
        onChange={(e) => props.onChange(e.target.value)}
    />;
}

type FileUploadControlProps = {
    label?: string
    acceptFormats: string[],
    allowCompressed?: boolean,
    onChange: (value: File) => void,
    onValidationError: (message: string) => void,
    style?: React.CSSProperties,
    className?: string
}

export function FileUploadControl(props: FileUploadControlProps) {

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            const name = file.name.toLowerCase();
            if (isValidFormat(name, props.acceptFormats, props.allowCompressed)) {
                props.onChange(file);
            } else {
                props.onValidationError('File format is not supported. Allowed formats: ' + props.acceptFormats);
            }
            return false;
        }
    };

    const isValidFormat = (name: string, allowedFormats: string[], allowCompressed = false): boolean => {
        let isValid = false;
        for (const format of allowedFormats) {
            isValid = isValid || name.endsWith(format);
            if (allowCompressed)
                isValid = isValid || name.endsWith(format + '.gz');
        }
        return isValid;
    };

    return (
        <Upload style={{ outline: 'none' }} {...uploadProps}>
            <button className={props.className}>
                <Icon
                    svg={UploadSvg}
                />
                <span className='btn-upload-label'>{props.label || 'Upload File'}</span>
            </button>
        </Upload>
    );
}

type UploadedFileProps = {
    name: string;
    className?: string,
    style?: React.CSSProperties
}

export function UploadedFile(props: UploadedFileProps) {
    return (
        <div className={props.className} style={props.style}>
            <span style={{ padding: '3px' }}>{props.name}</span>
            <Icon
                svg={PaperClipSvg}
                className='upload-icon'
            />
        </div>
    );
}

type SelectorControlProps = {
    value: string,
    options: string[] | string[][],
    isDisabled?: boolean,
    onChange: (value: string) => void,
    className?: string,
    style?: React.CSSProperties
}

export function SelectorControl(props: SelectorControlProps) {
    return (
        <div className={props.className} style={props.style}>
            <Select
                placeholder='Chain ID'
                value={props.value}
                disabled={props.isDisabled}
                onChange={(e) => props.onChange(e)}>
                {
                    props.options.length > 0 && props.options.map((item, i) => {
                        let value, option;
                        if (Array.isArray(item)) { [value, option] = item; } else { value = option = item; }
                        return <Option key={i} value={value}>{option}</Option>;
                    })
                }
            </Select>
        </div>
    );
}