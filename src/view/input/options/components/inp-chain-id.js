import React from 'react'

export default function ChainID({ value, onValueChange, disabled }) {
  return (
    <input
      type='text'
      value={value}
      placeholder='Chain ID'
      disabled={disabled}
      className={'inp'}
      style={{ width: '70px' }}
      onChange={(e) => onValueChange(e.target.value)}
    />
  )
}
