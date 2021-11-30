import React from 'react';
import ChainID from './inp-chain-id';
import Selector from '../../../select/select';


export default function ChainSelector({ value, options, onValueChange }) {
    return (
      <>
        {options.length > 0 && 
          <div className={'inp-select'}>
            <Selector
              value={value}
              options={options}
              disabled={false}
              cb={onValueChange}
            />
          </div>
        }
        {options.length === 0 && 
            <ChainID 
                value={''}
                disabled={true}
                onValueChange={onValueChange}
            />
        }
      </>
    )
  }