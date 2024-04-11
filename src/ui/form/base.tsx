import { useState, useEffect } from 'react';
import classNames from 'classnames';

import { createInstanceLabel, isValidEntryId } from '../../utils/identifier';
import Select from 'rc-select';
import { SolidArrowDownSvg } from '../icons';

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
        return <div className='inp-select'>
            <Select
                value={String(props.value)}
                suffixIcon={() => SolidArrowDownSvg('20', '20', '5 3 20 20')}
                options={options}
                disabled={props.isDisabled}
                onChange={props.onChange}
            />
        </div>;
    } else {
        return <AsymInputComponent
            value=''
            isDisabled={true}
            onChange={props.onChange}
        />;
    }
}

export function AsymInputComponent(props: BaseProps) {
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
        style={{ width: '55px' }}
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
        style={{ width: '75px' }}
        onChange={(e) => update(e.target.value)}
    />;
}
