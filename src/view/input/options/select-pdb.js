import React, { useState, useEffect } from 'react'

import EntryID from './components/inp-entry-id'
import ChainSelector from './components/inp-chain-selector'
import ResidueID from './components/inp-resid-id'

import { getAsymIdsMemoized } from '../../../utils/data'
import { createAsymLabel } from '../../../utils/common'
import InputOptionsEnum from '../../../model/enum/enum-input-options'

const type = InputOptionsEnum.PDB_ENTRY;

export default function SelectPDB({ ctx, index }) {

    const entry_id = ctx.getEntryId(index, type);
    const asym_id = ctx.getAsymId(index, type);
    const beg_seq_id = ctx.getBegSeqId(index, type);
    const end_seq_id = ctx.getEndSeqId(index, type);
  
    const [asymOptions, setAsymOptions] = useState([]);
  
    useEffect(() => getAsymOptions(), [entry_id])
  
    const getAsymOptions = async () => {
      const options = []
      if (entry_id && entry_id.length == 4) {
        const values = await getAsymIdsMemoized(entry_id)
        if (values.length > 0) {
          for (const val of values) {
            const asymId = val[0]
            const authAsymId = val[1]
            const label = createAsymLabel(asymId, authAsymId)
            options.push([asymId, label])
          }
          if (!asym_id) ctx.updateAsymId(values[0][0], index)
        }
      }
      setAsymOptions(options)
    }

    return (
        <>
          <EntryID
            value={entry_id || ''}
            onValueChange={(v) => ctx.updateEntryId(v, index, type)}
          />
    
          <ChainSelector
            value={asym_id || ''}
            options={asymOptions}
            onValueChange={(v) => ctx.updateAsymId(v, index, type)}
          />

          <ResidueID 
            label='Beg'
            value={beg_seq_id || ''}
            disabled={!ctx.isValidEntryId(index)}
            onValueChange={(v) => ctx.updateBegSeqId(v, index, type)}
          />

          <ResidueID 
            label='End'
            value={end_seq_id || ''}
            disabled={!ctx.isValidEntryId(index)}
            onValueChange={(v) => ctx.updateEndSeqId(v, index, type)}
          />
        </>
      )
}