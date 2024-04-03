import { useState, useEffect } from 'react';
import classNames from 'classnames';

import {
    InputBoxControl
} from '../controls/controls-input';

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
    return <InputBoxControl
        type='text'
        label={props.label}
        value={props.value}
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
