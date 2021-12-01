import React, { useState } from 'react';
import classNames from 'classnames';

import Selector from '../select/select';
import MethodParams from './params/method-params';
import { MethodOptionsEnum, hasParameters, ALIGNMENT_METHOD_DEFAULT } from '../../model/enum/enum-method-options';

export default function MethodSelection({ ctx }) {
    const styleHorizontal = classNames('inp-space', 'inp-space-horizontal');
    const styleActionBtn = classNames('btn-action', 'btn-menu');

    const [isParamsOpen, setParamsVisibility] = useState(false);

    function toggleParams() {
        setParamsVisibility(!isParamsOpen);
    }

    function handleChange(val) {
        setParamsVisibility(false);
        ctx.updateMethodName(val);
    }

    const value = ctx.getMethodName() ? ctx.getMethodName() : ALIGNMENT_METHOD_DEFAULT.value;
    const options = Object.values(MethodOptionsEnum).map((item) => [item.value, item.name]);
    return (
        <>
            <div className={styleHorizontal}>
                <Selector
                    value={value}
                    options={options}
                    disabled={false}
                    cb={(e) => handleChange(e)}
                    style={'inp-method'}
                />
                {hasParameters(value) &&
          <button className={styleActionBtn} onClick={toggleParams}>
            Parameters
          </button>
                }
            </div>
            {isParamsOpen && <MethodParams ctx={ctx}/>}
        </>
    );
}
