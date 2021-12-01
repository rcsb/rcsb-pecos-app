import React from 'react';
import classNames from 'classnames';
import HelpCircle from '../../icons/help';

export default function SmithWatermanParams({ ctx }) {

    const inputStyle = classNames('inp', 'inp-num');

    function handleInputChange(name, value) {
        ctx.updateMethodParam(name, value);
    }

    return (
        <table className='tbl-params'>
            <tbody>
                <tr>
                    <td>Gap Opening Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('gap_opening_penalty') ?? 3}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange(
                                    'gap_opening_penalty',
                                    parseInt(e.target.value)
                                )
                            }
                        />
                        <span
                            data-tooltip='Gap opening penalty'
                            data-flow='top'
                            className='txt-tooltip'
                        >
                            <HelpCircle />
                        </span>
                    </td>
                    <td>Gap Extension Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('gap_extension_penalty') ?? 5}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange(
                                    'gap_extension_penalty',
                                    parseInt(e.target.value)
                                )
                            }
                        />
                        <span
                            data-tooltip='Gap extension penalty'
                            data-flow='top'
                            className='txt-tooltip'
                        >
                            <HelpCircle />
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}
