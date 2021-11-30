import React from 'react';
import InputItem from './input-item';

export default function InputList({ ctx, itemsList, onRemove, onChange }) {

    return (
        <>
            {itemsList.length > 0 && itemsList.map((value, i) => { 
                return <InputItem 
                    key={i} 
                    id={value}
                    ctx={ctx}
                    index={i}
                    onChange={onChange}
                    onRemove={onRemove} />
                })
            }
        </>
    )
}
