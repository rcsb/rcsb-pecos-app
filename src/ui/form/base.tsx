import '../skin/selector.css';
import '../skin/suggestions.css';
import classNames from 'classnames';
import { useState, useEffect, CSSProperties, useRef } from 'react';

import Select from 'rc-select';
import Autosuggest, { SuggestionsFetchRequestedParams } from 'react-autosuggest';

import { SolidArrowDownSvg } from '../icons';
import { createInstanceLabel, isValidEntryId } from '../../utils/identifier';

type BaseProps = {
    value?: string | number,
    label?: string,
    onChange: (value: string) => void,
    isDisabled?: boolean
}

export type SelectOption<T> = {
    label: string,
    title?: string,
    value?: T,
    options?: SelectOption<T>[]
}

type AutosuggestProps = {
    value: string,
    label?: string,
    suggestDebounceMs: number,
    suggestHandler: (value: string) => Promise<string[]>,
    onChange: (value: string) => void,
    style?: CSSProperties,
    className?: string
}

export function AutosuggestComponent(props: AutosuggestProps) {

    const timeoutId = useRef<number | null>(null);
    const [selection, setSelection] = useState<string>();
    const [suggestions, setSuggestions] = useState<Array<string>>([]);

    const onRenderAction = (value: string): JSX.Element => <div>{value}</div>;

    function onSelectAction(_: React.FormEvent<HTMLElement>, data: Autosuggest.SuggestionSelectedEventData<string>): void {
        const v = data.suggestion;
        if (props.value !== v) props.onChange(v);
    }

    function onChangeAction(_: React.FormEvent<HTMLElement>, change: Autosuggest.ChangeEvent): void {
        const value = change.newValue?.trim().toUpperCase() || '';
        if (props.value !== value) {
            props.onChange(value);
        }
    }

    function onFetchAction(request: SuggestionsFetchRequestedParams): void {
        if (timeoutId.current !== null) {
            window.clearTimeout(timeoutId.current);
        }

        timeoutId.current = window.setTimeout(() => {
            timeoutId.current = null;
            props.suggestHandler(request.value).then((values) => {
                if (values.length > 1) {
                    setSelection(undefined);
                    setSuggestions(values);
                } else if (values.length === 1 && values[0] !== selection) {
                    props.onChange(values[0]);
                    setSelection(values[0]);
                    setSuggestions([]);
                } else { // clear suggestions
                    setSuggestions([]);
                }
            });
        }, props.suggestDebounceMs);
    }

    const inputProps = {
        id: 'input-area',
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
        return <div className='inp-select' style={{ width: '70px', minWidth: 'max-content' }}>
            <Select
                value={String(props.value)}
                suffixIcon={() => SolidArrowDownSvg('20', '20', '5 3 20 20')}
                options={options}
                disabled={props.isDisabled}
                onChange={props.onChange}
            />
        </div>;
    } else {
        return <TextInputComponent
            value=''
            isDisabled={true}
            onChange={props.onChange}
        />;
    }
}

export function TextInputComponent(props: BaseProps) {
    return <input
        id='input-area'
        type='text'
        value={props.value}
        placeholder={props.label}
        disabled={props.isDisabled}
        className={classNames('inp')}
        style={{ width: '70px' }}
        onChange={(e) => props.onChange(e.target.value)}
    />;
}

export function IntegerInputComponent(props: BaseProps) {
    const toValue = (i: string) => {
        const num = parseInt(i);
        if (isNaN(num) || num < 1) return '';
        else return num;
    };
    return <input
        id='input-area'
        type='text'
        value={toValue(String(props.value))}
        placeholder={props.label}
        disabled={props.isDisabled}
        className={classNames('inp')}
        style={{ width: '70px' }}
        onChange={(e) => props.onChange(e.target.value)}
    />;
}

export function FloatInputComponent(props: BaseProps) {

    const [value, setValue] = useState<string>(String(props.value));

    const update = (val: string) => {
        const v = toValue(val);
        setValue(v);
        props.onChange(v);
    };

    const toValue = (i: string) => {
        const regex = /\d+\.*(\d+)?/g;
        const arr = i.match(regex);
        if (arr && arr?.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            return arr![0];
        }
        return '';
    };

    return <input
        id='input-area'
        type='text'
        value={value || ''}
        placeholder={props.label}
        disabled={props.isDisabled}
        className={classNames('inp')}
        style={{ width: '70px' }}
        onChange={(e) => update(e.target.value)}
    />;
}
