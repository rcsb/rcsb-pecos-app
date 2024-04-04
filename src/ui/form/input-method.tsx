/* eslint-disable @typescript-eslint/no-non-null-assertion */
import classNames from 'classnames';
import Select from 'rc-select';
import { useState } from 'react';
import { QCP, JFATCATRigid, JFATCATFlexible, JCE, JCECP, SmithWaterman3D } from '../../auto/alignment/alignment-request';
import { RequestState } from '../../state/request';
import { horizontal } from '../../utils/constants';
import { MethodName, toMethodImpl } from '../../utils/request';
import { ActionButtonControl } from '../controls/controls-button';
import { HelpCircleSvg, SolidArrowDownSvg } from '../icons';
import { SelectOption } from './base';

const numInpClass = classNames('inp', 'inp-num');

type DisplayMethod = Exclude<MethodName, QCP['name']>;

function FatCatRigidParams(props: {ctx: RequestState}) {
    const next = props.ctx.copy();
    const nextParams = (next.query.context.method as JFATCATRigid).parameters;
    const currParams = (props.ctx.state.query.context.method as JFATCATRigid).parameters;
    return (
        <table className='method-params'>
            <tbody>
                <tr>
                    <td>RMSD Cutoff:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.rmsd_cutoff || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.rmsd_cutoff = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='RMSD cutoff for AFP detection'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>AFP Distance Cutoff:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.afp_dist_cutoff || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.afp_dist_cutoff = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='The distance cutoff used when calculating connectivity of AFP pairs'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Fragment Length:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.fragment_length || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.fragment_length = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='The length of the fragments'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function FatCatFlexParams(props: {ctx: RequestState}) {
    const next = props.ctx.copy();
    const nextParams = (next.query.context.method as JFATCATFlexible).parameters;
    const currParams = (props.ctx.state.query.context.method as JFATCATFlexible).parameters;
    return (
        <table className='method-params'>
            <tbody>
                <tr>
                    <td>RMSD Cutoff:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.rmsd_cutoff || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.rmsd_cutoff = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='RMSD cutoff for AFP detection'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>AFP Distance Cutoff:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.afp_dist_cutoff || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.afp_dist_cutoff = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='The distance cutoff used when calculating connectivity of AFP pairs'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Fragment Length:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.fragment_length || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.fragment_length = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='The length of the fragments'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Max Twists Number:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.max_num_twists || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.max_num_twists = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='The number of twists that are allowed to be introduced. If set to 0 alignments are run in rigid mode'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function CeParams(props: {ctx: RequestState}) {
    const next = props.ctx.copy();
    const nextParams = (next.query.context.method as JCE).parameters;
    const currParams = (props.ctx.state.query.context.method as JCE).parameters;
    return (
        <table className='method-params'>
            <tbody>
                <tr>
                    <td>Maximum Gap Size:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_max_size || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_max_size = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Maximum gap size G, that is applied during the AFP extension'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Gap Opening Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_opening_penalty || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_opening_penalty = parseFloat(e.target.value);
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Gap opening penalty during alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Gap Extension Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_extension_penalty || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_extension_penalty = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Gap extension penalty during alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Fragment Size:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.fragment_size || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.fragment_size = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Fragment size of Aligned Fragment Pairs (AFPs)'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>RMSD Threshold:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.rmsd_threshold || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.rmsd_threshold = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='RMSD threshold used while tracing the Aligned Fragment Pair (AFP) fragments'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Maximum RMSD:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.max_opt_rmsd || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.max_opt_rmsd = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Maximum RMSD at which to stop alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function CeCpParams(props: {ctx: RequestState}) {
    const next = props.ctx.copy();
    const nextParams = (next.query.context.method as JCECP).parameters;
    const currParams = (props.ctx.state.query.context.method as JCECP).parameters;
    return (
        <table className='method-params'>
            <tbody>
                <tr>
                    <td>Maximum Gap Size:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_max_size || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_max_size = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Maximum gap size G, that is applied during the AFP extension'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Gap Opening Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_opening_penalty || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_opening_penalty = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Gap opening penalty during alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Gap Extension Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_extension_penalty || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_extension_penalty = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Gap extension penalty during alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Fragment Size:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.fragment_size || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.fragment_size = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Fragment size of Aligned Fragment Pairs (AFPs)'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>RMSD Threshold:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.rmsd_threshold || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.rmsd_threshold = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='RMSD threshold used while tracing the Aligned Fragment Pair (AFP) fragments'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Maximum RMSD:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.max_opt_rmsd || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.max_opt_rmsd = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Maximum RMSD at which to stop alignment optimization'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
                <tr>
                    <td>Min CP Block Length:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.min_cp_length || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.min_cp_length = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Minimum length for a Circular Permutation block to consider'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function SmithWatermanParams(props: {ctx: RequestState}) {
    const next = props.ctx.copy();
    const nextParams = (next.query.context.method as SmithWaterman3D).parameters;
    const currParams = (props.ctx.state.query.context.method as SmithWaterman3D).parameters;
    return (
        <table className='method-params'>
            <tbody>
                <tr>
                    <td>Gap Opening Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_opening_penalty || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_opening_penalty = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Gap opening penalty'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                    <td>Gap Extension Penalty:</td>
                    <td>
                        <input
                            type='number'
                            value={currParams?.gap_extension_penalty || ''}
                            className={numInpClass}
                            onChange={(e) => {
                                nextParams!.gap_extension_penalty = e.target.value ? parseFloat(e.target.value) : undefined;
                                props.ctx.push(next);
                            }}
                        />
                        <span
                            data-tooltip='Gap extension penalty'
                            data-flow='top'
                            className='txt-tooltip'
                        ><HelpCircleSvg />
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    );
}

function StructureAlignmentMethodParams(props: {ctx: RequestState}) {
    const method = props.ctx.state.query.context.method.name;
    switch (method) {
        case 'fatcat-rigid':
            return <FatCatRigidParams ctx={props.ctx} />;
        case 'fatcat-flexible':
            return <FatCatFlexParams ctx={props.ctx} />;
        case 'ce':
            return <CeParams ctx={props.ctx} />;
        case 'ce-cp':
            return <CeCpParams ctx={props.ctx} />;
        case 'smith-waterman-3d':
            return <SmithWatermanParams ctx={props.ctx} />;
        default:
            throw new Error('Unsupported method: ' + method);
    }
}

export function StructureAlignmentMethod(props: {ctx: RequestState}) {

    const [paramsVisible, setVisibility] = useState(false);

    const toggleVisibility = () => {
        setVisibility(!paramsVisible);
    };

    const onMethodUpdate = (value: string) => {
        setVisibility(false);
        const request = props.ctx.copy();
        request.query.context.method = toMethodImpl({ name: value as MethodName });
        props.ctx.push(request);
    };

    const method = props.ctx.state.query.context.method;
    const options: SelectOption<DisplayMethod>[] = [
        {
            label: 'Rigid Methods',
            title: '',
            options: [
                {
                    label: 'jFATCAT (rigid)',
                    value: 'fatcat-rigid',
                    title: 'Rigid-body protein structure comparison for identification of the largest structurally conserved core'
                },
                {
                    label: 'jCE',
                    value: 'ce',
                    title: 'Rigid-body protein structure comparison for identification of the optimal set of substructural similarities'
                },
                {
                    label: 'TM-align',
                    value: 'tm-align',
                    title: 'Fast TM-score based protein structure copmarison for proteins with similar global topology'
                },
                {
                    label: 'Smith-Waterman 3D',
                    value: 'smith-waterman-3d',
                    title: 'Sequence-dependent protein structure comparison for close homologues'
                }
            ]
        },
        {
            label: 'Flexible Methods',
            options: [
                {
                    label: 'jFATCAT (flexible)',
                    value: 'fatcat-flexible',
                    title: 'Flexible protein structure comparison for identification of internally rigid domains in the presence of large conformational changes'
                },
                {
                    label: 'jCE-CP',
                    value: 'ce-cp',
                    title: 'Flexible structure comparison for proteins with similar overall three-dimensional shape but diffrent connectivity (circular permutations)'
                }
            ]
        }
    ];
    return <>
        <div className={horizontal}>
            <div className='inp-outer inp-method'>
                <label className='inp-label'>Alignment Method</label>
                <Select
                    placeholder='Method Name'
                    suffixIcon={() => SolidArrowDownSvg('20', '20', '5 3 20 20')}
                    value={method.name}
                    options={options}
                    disabled={false}
                    onChange={onMethodUpdate}
                    className='inp-method'
                />
            </div>
            {('parameters' in method) &&
            <div style={{ marginTop: '18px' }}>
                <ActionButtonControl
                    label='Parameters'
                    onClick={toggleVisibility}
                    className={classNames('btn-action', 'btn-menu')}
                />
            </div>}
        </div>
        {paramsVisible &&
        <StructureAlignmentMethodParams
            ctx={props.ctx}
        />}
    </>;
}