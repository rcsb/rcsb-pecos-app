import React from 'react';
import classNames from 'classnames';

export default function ResidueID({ label, value, onValueChange, disabled }) {
    return (
        <input
            type='number'
            placeholder={label}
            className={classNames('inp', 'inp-num')}
            value={value}
            disabled={disabled}
            onChange={(e) => onValueChange(parseInt(e.target.value))}
        />
    );
}
