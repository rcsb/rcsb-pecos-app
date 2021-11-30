import React from 'react'
import classNames from 'classnames'
import HelpCircle from '../../icons/help'

export default function FatCatFlexParams({ ctx }) {

  const inputStyle = classNames('inp', 'inp-num');

  function handleInputChange(name, value) {
    ctx.updateMethodParam(name, value)
  }

  return (
    <table className='tbl-params'>
      <tbody>
        <tr>
          <td>RMSD Cutoff:</td>
          <td>
            <input
              type='number'
              value={ctx.getMethodParam('rmsd_cutoff') ?? 3}
              className={inputStyle}
              onChange={(e) =>
                handleInputChange('rmsd_cutoff', parseFloat(e.target.value))
              }
            />
            <span
              data-tooltip='RMSD cutoff for AFP detection'
              data-flow='top'
              className='txt-tooltip'
            >
              <HelpCircle />
            </span>
          </td>
          <td>AFP Distance Cutoff:</td>
          <td>
            <input
              type='number'
              value={ctx.getMethodParam('afp_dist_cutoff') ?? 5}
              className={inputStyle}
              onChange={(e) =>
                handleInputChange('afp_dist_cutoff', parseFloat(e.target.value))
              }
            />
            <span
              data-tooltip='The distance cutoff used when calculating connectivity of AFP pairs'
              data-flow='top'
              className='txt-tooltip'
            >
              <HelpCircle />
            </span>
          </td>
          <td>Fragment Length:</td>
          <td>
            <input
              type='number'
              value={ctx.getMethodParam('fragment_length') ?? 8}
              className={inputStyle}
              onChange={(e) =>
                handleInputChange('fragment_length', parseInt(e.target.value))
              }
            />
            <span
              data-tooltip='The length of the fragments'
              data-flow='top'
              className='txt-tooltip'
            >
              <HelpCircle />
            </span>
          </td>
        </tr>
        <tr>
          <td>Max Twists Number:</td>
          <td>
            <input
              type='number'
              value={ctx.getMethodParam('max_num_twists') ?? 5}
              className={inputStyle}
              onChange={(e) =>
                handleInputChange('max_num_twists', parseInt(e.target.value))
              }
            />
            <span
              data-tooltip='The number of twists that are allowed to be introduced. If set to 0 alignments are run in rigid mode'
              data-flow='top'
              className='txt-tooltip'
            >
              <HelpCircle />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  )
}
