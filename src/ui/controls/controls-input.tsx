import '../skin/selector.css';
import '../skin/suggestions.css';

import { useState, CSSProperties, useRef } from 'react';
import Autosuggest, { ChangeEvent, SuggestionsFetchRequestedParams } from 'react-autosuggest';

type AutosuggestControlProps = {
    value: string,
    label?: string,
    suggestHandler: (value: string) => Promise<string[]>,
    onChange: (value: string) => void,
    style?: CSSProperties,
    className?: string
}

export function AutosuggestControl(props: AutosuggestControlProps) {

    const debounceTimeoutMs = 500;

    const timeoutId = useRef<number | null>(null);
    const [selection, setSelection] = useState<string>();
    const [suggestions, setSuggestions] = useState<Array<string>>([]);

    const onRenderAction = (value: string): JSX.Element => <div>{value}</div>;

    function onSelectAction(_: React.FormEvent<HTMLElement>, data: Autosuggest.SuggestionSelectedEventData<string>): void {
        const v = data.suggestion;
        if (props.value !== v) props.onChange(v);
    }

    function onChangeAction(_: React.FormEvent<HTMLElement>, change: ChangeEvent): void {
        const value = change.newValue?.trim().toUpperCase() || '';
        if (props.value !== value) {
            props.onChange(value);
        }
    }

    function onFetchAction(request: SuggestionsFetchRequestedParams): void {
        if (timeoutId.current !== null) {
            console.log('Cancel event for ', request.value, timeoutId.current);
            window.clearTimeout(timeoutId.current);
        }

        timeoutId.current = window.setTimeout(() => {
            timeoutId.current = null;
            console.log('Execute event for ', request.value, timeoutId.current);
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
        }, debounceTimeoutMs);
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
