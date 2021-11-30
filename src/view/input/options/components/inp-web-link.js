import React from 'react'
import classNames from 'classnames'

export default function WebLink({ value, onValueChange }) {
    return (
        <input
            type='text'
            value={value}
            placeholder='https://'
            className={classNames('inp', 'inp-link')}
            onChange={(e) => onValueChange(e.target.value)}
        />
    )
}