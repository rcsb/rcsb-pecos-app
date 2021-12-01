import React from 'react';
import classNames from 'classnames';
import HelpCircle from '../../icons/help';

export default function CeCpParams({ ctx }) {

    const inputStyle = classNames('inp', 'inp-num');

    function handleInputChange(name, value) {
        ctx.updateMethodParam(name, value);
    }

    return (
        <table className='tbl-params'>
            <tbody>
                <tr>
                    <td>Maximum Gap Size:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('gap_max_size') ?? 30}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange('gap_max_size', parseInt(e.target.value))
                            }
                        />
                        <span
                            data-tooltip='Maximum gap size G, that is applied during the AFP extension'
                            data-flow='top'
                            className='txt-tooltip'
                        >
                            <HelpCircle />
                        </span>
                    </td>
                    <td>Gap Opening Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('gap_opening_penalty') ?? 5}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange(
                                    'gap_opening_penalty',
                                    parseFloat(e.target.value)
                                )
                            }
                        />
                        <span
                            data-tooltip='Gap opening penalty during alignment optimization'
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
                            value={ctx.getMethodParam('gap_extension_penalty') ?? 0.5}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange(
                                    'gap_extension_penalty',
                                    parseFloat(e.target.value)
                                )
                            }
                        />
                        <span
                            data-tooltip='Gap extension penalty during alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        >
                            <HelpCircle />
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Fragment Size:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('fragment_size') ?? 8}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange('fragment_size', parseInt(e.target.value))
                            }
                        />
                        <span
                            data-tooltip='Fragment size of Aligned Fragment Pairs (AFPs)'
                            data-flow='top'
                            className='txt-tooltip'
                        >
                            <HelpCircle />
                        </span>
                    </td>
                    <td>RMSD Threshold:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('rmsd_threshold') ?? 3}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange('rmsd_threshold', parseFloat(e.target.value))
                            }
                        />
                        <span
                            data-tooltip='RMSD threshold used while tracing the Aligned Fragment Pair (AFP) fragments'
                            data-flow='top'
                            className='txt-tooltip'
                        >
                            <HelpCircle />
                        </span>
                    </td>
                    <td>Maximum RMSD:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('max_opt_rmsd') ?? 99}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange('max_opt_rmsd', parseFloat(e.target.value))
                            }
                        />
                        <span
                            data-tooltip='Maximum RMSD at which to stop alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        >
                            <HelpCircle />
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Min CP Block Length:</td>
                    <td>
                        <input
                            type='number'
                            value={ctx.getMethodParam('min_cp_length') ?? 5}
                            className={inputStyle}
                            onChange={(e) =>
                                handleInputChange('min_cp_length', parseInt(e.target.value))
                            }
                        />
                        <span
                            data-tooltip='Minimum length for a Circular Permutation block to consider'
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
