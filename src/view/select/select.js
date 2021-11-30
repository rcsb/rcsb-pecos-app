import './index.css'

import React from 'react';
import Select, { Option } from 'rc-select';

export default function Selector({value, options, disabled, cb, style}) {
    return (
        <div className={style}>
            <Select value={value}
                    disabled={disabled} 
                    onChange={(e) => cb(e)}>    
                {options.length > 0 && options.map((item, i) => { 
                    let value, option;
                    if (Array.isArray(item)) {[value, option] = item;} 
                    else {value, option = item;}
                    return <Option key={i} value={value}>{option}</Option>})
                }
            </Select>
        </div>
    );
}