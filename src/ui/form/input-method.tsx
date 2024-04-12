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
import { FloatInputComponent, IntegerInputComponent, SelectOption } from './base';

type DisplayMethod = Exclude<MethodName, QCP['name']>;

function createLabel(label: string, tooltip: string) {
    return <span>
        <span className='inp-label'>
            {label}
        </span>
        <span
            className='txt-tooltip'
            data-flow='top'
            data-tooltip={tooltip}> <HelpCircleSvg />
        </span>
    </span>;
}

function FatCatRigidParams(props: {ctx: RequestState}) {
    const next = props.ctx.copy();
    const nextParams = (next.query.context.method as JFATCATRigid).parameters;
    const currParams = (props.ctx.state.query.context.method as JFATCATRigid).parameters;
    return (
        <table className='method-params'>
            <tbody>
                <tr>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('RMSD Cutoff', 'RMSD cutoff for AFP detection')}
                            <FloatInputComponent
                                value={currParams?.rmsd_cutoff}
                                onChange={(v) => {
                                    nextParams!.rmsd_cutoff = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('AFP Distance Cutoff', 'The distance cutoff used when calculating connectivity of AFP pairs')}
                            <FloatInputComponent
                                value={currParams?.afp_dist_cutoff}
                                onChange={(v) => {
                                    nextParams!.afp_dist_cutoff = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Fragment Length', 'The length of the fragments')}
                            <IntegerInputComponent
                                value={currParams?.fragment_length}
                                onChange={(v) => {
                                    nextParams!.fragment_length = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
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
                    <td>
                        <div className='inp-outer'>
                            {createLabel('RMSD Cutoff', 'RMSD cutoff for AFP detection')}
                            <FloatInputComponent
                                value={currParams?.rmsd_cutoff}
                                onChange={(v) => {
                                    nextParams!.rmsd_cutoff = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('AFP Distance Cutoff', 'The distance cutoff used when calculating connectivity of AFP pairs')}
                            <FloatInputComponent
                                value={currParams?.afp_dist_cutoff}
                                onChange={(v) => {
                                    nextParams!.afp_dist_cutoff = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Fragment Length', 'The length of the fragments')}
                            <IntegerInputComponent
                                value={currParams?.fragment_length}
                                onChange={(v) => {
                                    nextParams!.fragment_length = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Max Number of Twists', 'The number of twists that are allowed to be introduced. If set to 0 alignments are run in rigid mode')}
                            <IntegerInputComponent
                                value={currParams?.fragment_length}
                                onChange={(v) => {
                                    nextParams!.fragment_length = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
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
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Maximum Gap Size', 'Maximum gap size G, that is applied during the AFP extension')}
                            <IntegerInputComponent
                                value={currParams?.gap_max_size}
                                onChange={(v) => {
                                    nextParams!.gap_max_size = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Gap Opening Penalty', 'Gap opening penalty during alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.gap_opening_penalty}
                                onChange={(v) => {
                                    nextParams!.gap_opening_penalty = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Gap Extension Penalty', 'Gap extension penalty during alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.gap_extension_penalty}
                                onChange={(v) => {
                                    nextParams!.gap_extension_penalty = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Fragment Size', 'Fragment size of Aligned Fragment Pairs (AFPs)')}
                            <IntegerInputComponent
                                value={currParams?.fragment_size}
                                onChange={(v) => {
                                    nextParams!.fragment_size = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('RMSD Threshold', 'RMSD threshold used while tracing the Aligned Fragment Pair (AFP) fragments')}
                            <FloatInputComponent
                                value={currParams?.rmsd_threshold}
                                onChange={(v) => {
                                    nextParams!.rmsd_threshold = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Maximum RMSD', 'Maximum RMSD at which to stop alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.max_opt_rmsd}
                                onChange={(v) => {
                                    nextParams!.max_opt_rmsd = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
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
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Maximum Gap Size', 'Maximum gap size G, that is applied during the AFP extension')}
                            <IntegerInputComponent
                                value={currParams?.gap_max_size}
                                onChange={(v) => {
                                    nextParams!.gap_max_size = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Gap Opening Penalty', 'Gap opening penalty during alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.gap_opening_penalty}
                                onChange={(v) => {
                                    nextParams!.gap_opening_penalty = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Gap Extension Penalty', 'Gap extension penalty during alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.gap_extension_penalty}
                                onChange={(v) => {
                                    nextParams!.gap_extension_penalty = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Fragment Size', 'Fragment size of Aligned Fragment Pairs (AFPs)')}
                            <IntegerInputComponent
                                value={currParams?.fragment_size}
                                onChange={(v) => {
                                    nextParams!.fragment_size = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('RMSD Threshold', 'RMSD threshold used while tracing the Aligned Fragment Pair (AFP) fragments')}
                            <FloatInputComponent
                                value={currParams?.rmsd_threshold}
                                onChange={(v) => {
                                    nextParams!.rmsd_threshold = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Maximum RMSD', 'Maximum RMSD at which to stop alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.max_opt_rmsd}
                                onChange={(v) => {
                                    nextParams!.max_opt_rmsd = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Min CP Block Length', 'Minimum length for a Circular Permutation block to consider')}
                            <IntegerInputComponent
                                value={currParams?.max_opt_rmsd}
                                onChange={(v) => {
                                    nextParams!.max_opt_rmsd = v ? parseInt(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
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
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Gap Opening Penalty', 'Gap opening penalty during alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.gap_opening_penalty}
                                onChange={(v) => {
                                    nextParams!.gap_opening_penalty = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
                    </td>
                    <td>
                        <div className='inp-outer'>
                            {createLabel('Gap Extension Penalty', 'Gap extension penalty during alignment optimization')}
                            <FloatInputComponent
                                value={currParams?.gap_extension_penalty}
                                onChange={(v) => {
                                    nextParams!.gap_extension_penalty = v ? parseFloat(v) : undefined;
                                    props.ctx.push(next);
                                }}
                            />
                        </div>
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
                <span className='inp-label'>Alignment Method</span>
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