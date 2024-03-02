/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '../skin/collapse.css';
import classNames from 'classnames';

import React, { useEffect, useState } from 'react';
import Collapse, { Panel } from 'rc-collapse';

import { RequestState } from '../../state/request';
import {
    QueryRequest,
    MethodName,
    toMethodImpl,
    Structure,
    StructureEntryImpl,
    StructureWebLinkImpl,
    StructureFileUploadImpl
} from '../../utils/request';

import { ActionButtonControl } from '../controls/controls-button';
import { AddActionControl, DeleteActionControl, SelectableControl } from '../controls/controls-action';

import { horizontal, vertical } from '../../utils/constants';
import { isEntry, isUploadedFile, isUrl, useObservable } from '../../utils/helper';

import {
    WebLinkInputComponent,
    FormatInputComponent,
    AsymInputComponent,
    ResidueInputComponent,
    FileInputComponent,
    EntryInputComponent,
    AsymSelectorComponent
} from './base';

import {
    JFATCATRigid,
    JFATCATFlexible,
    JCE,
    JCECP,
    SmithWaterman3D,
    QCP,
    StructureInstanceSelection,
    StructureEntry,
    StructureFileUpload,
    StructureWebLink,
    StructureFileFormat
} from '../../auto/alignment/alignment-request';

import { AutosuggestControl, InputBoxControl, SelectOption, SelectorControl } from '../controls/controls-input';
import { Icon, LineArrowDownSvg, HelpCircleSvg } from '../icons';
import { ApplicationContext } from '../../context';
import { isValidMgnifyId, isValidUniprotId } from '../../utils/identifier';

const numInpClass = classNames('inp', 'inp-num');

type StructureImpl = StructureEntryImpl | StructureFileUploadImpl | StructureWebLinkImpl;
type StructureInputOption = 'Entry ID' | 'UniProt ID' | 'File URL' | 'File Upload' | 'AlphaFold DB' | 'ESMAtlas';
const structureOptions: { [key in StructureInputOption]: () => StructureImpl } = {
    'Entry ID': () => new StructureEntryImpl(),
    'UniProt ID': () => new StructureEntryImpl(),
    'File URL': () => new StructureWebLinkImpl(),
    'File Upload': () => new StructureFileUploadImpl(),
    'AlphaFold DB': () => new StructureWebLinkImpl(),
    'ESMAtlas': () => new StructureWebLinkImpl()
};

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

function StructureAlignmentMethod(props: {ctx: RequestState}) {

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
                    value: 'fatcat-rigid'
                },
                {
                    label: 'jCE',
                    value: 'ce'
                },
                {
                    label: 'TM-align',
                    value: 'tm-align'
                },
                {
                    label: 'Smith-Waterman 3D',
                    value: 'smith-waterman-3d'
                }
            ]
        },
        {
            label: 'Flexible Methods',
            options: [
                {
                    label: 'jFATCAT (flexible)',
                    value: 'fatcat-flexible'
                },
                {
                    label: 'jCE-CP',
                    value: 'ce-cp'
                }
            ]
        }
    ];
    return <>
        <div className={horizontal}>
            <SelectorControl
                placeholder='Method Name'
                value={method.name}
                options={options}
                isDisabled={false}
                onChange={onMethodUpdate}
                className='inp-method'
            />
            {('parameters' in method) &&
            <ActionButtonControl
                label='Parameters'
                onClick={toggleVisibility}
                className={classNames('btn-action', 'btn-menu')}
            />}
        </div>
        {paramsVisible &&
        <StructureAlignmentMethodParams
            ctx={props.ctx}
        />}
    </>;
}

function StructureSelectorByUniprotId(props: {
    ctx: ApplicationContext,
    onChange: (value: string) => void
}) {
    const [uniprotId, updateUniprotId] = useState('');

    const [options, setOptions] = useState<SelectOption<string>[]>([]);
    useEffect(() => { getInstancesByUniprot(); }, [uniprotId]);

    const getInstancesByUniprot = async () => {
        const opts: SelectOption<string>[] = [];
        if (isValidUniprotId(uniprotId)) {
            const ids = await props.ctx.search().matchInstancesByUniProtId(uniprotId, 20);
            if (ids.length > 0) {
                const ranges = await props.ctx.data().referenceSequenceCoverage(ids, uniprotId);
                for (const id of ids) {
                    const label = id + ':' + ranges.get(id)?.map(r => r.join('-')).join(',');
                    opts.push({ label: label, value: id });
                }
            }
        }
        setOptions(opts);
    };

    return <>
        <AutosuggestControl
            value={uniprotId || ''}
            label={'UniProt ID'}
            onChange={updateUniprotId}
            suggestHandler={props.ctx.search().suggestUniprotID.bind(props.ctx.search())}
            className={classNames('inp', 'inp-entry')}
        />
        <SelectorControl
            value={'Select protein chain'}
            placeholder='Chain ID'
            options={options}
            isDisabled={options.length === 0}
            onChange={props.onChange}
            className='inp-select'
        />
    </>;
}

function AlphaFoldDbStructureSelector(props: {
    ctx: ApplicationContext,
    onChange: (value: string) => void
}) {
    const [uniprotId, updateUniprotId] = useState('');
    useEffect(() => { getAlphaFoldStructureByUniprotId(); }, [uniprotId]);

    const base = 'https://alphafold.ebi.ac.uk/api/prediction/';
    const getAlphaFoldStructureByUniprotId = async () => {
        if (isValidUniprotId(uniprotId)) {
            const url = base + uniprotId;
            const cifUrl = await fetch(url)
                .then(response => response.json())
                .then(json => {
                    if (json) {
                        const entry = json[0];
                        return entry.cifUrl;
                    } else throw Error('Failed to fetch data from [ ' + url + ' ]: ' + json.error);
                });
            props.onChange(cifUrl);
        }
    };

    return <InputBoxControl
        type='text'
        value={uniprotId || ''}
        label='UniProt ID'
        onChange={updateUniprotId}
        style={{ width: '90px' }}
        className='inp'
    />;
}

// https://api.esmatlas.com/fetchPredictedStructure/MGYP001006757307.cif
function ESMAtlasStructureSelector(props: {
    ctx: ApplicationContext,
    onChange: (value: string) => void
}) {
    const [mgnifyId, updateMgnifyId] = useState('');
    useEffect(() => { getESMAtlasStructureByMgnifyId(); }, [mgnifyId]);

    const base = 'https://api.esmatlas.com/fetchPredictedStructure/';
    const getESMAtlasStructureByMgnifyId = async () => {
        if (isValidMgnifyId(mgnifyId)) {
            const url = base + mgnifyId + '.cif';
            props.onChange(url);
        }
    };

    return <InputBoxControl
        type='text'
        value={mgnifyId || ''}
        label='MGnify Protein ID'
        onChange={updateMgnifyId}
        style={{ width: '180px' }}
        className='inp'
    />;
}

export function StructureAlignmentInput(props: {
    ctx: ApplicationContext,
    onSubmit: (r: QueryRequest) => void,
    isCollapsed: boolean
}) {
    const [activeKey, updateKey] = useState(['0']);
    useEffect(() => { if (props.isCollapsed) updateKey([]); }, [props.isCollapsed]);

    const handler = props.ctx.state.data.request;
    const [request, setRequest] = useState(handler.state);
    useObservable<QueryRequest>(handler.subject, setRequest);

    // Allow to add up to 10 structures to the alignment request
    const MAX_NUM_STRUCTURES = 10;
    const initStructureListState = (state: QueryRequest) => {
        const list = new Array<StructureInputOption>();
        state.query.context.structures.map((s, i) => {
            if (isEntry(s)) {
                list[i] = 'Entry ID';
            } else if (isUrl(s)) {
                list[i] = 'File URL';
            } else if (isUploadedFile(s)) {
                list[i] = 'File Upload';
            } else {
                throw new Error('Initialization from state is not implemented. Structure: ' + s);
            }
        });
        return list;
    };
    const [structureList, setStructureList] = useState(initStructureListState(handler.state));

    const updateStructure = (index: number, s: Structure) => {
        const clone = handler.copy();
        clone.query.context.structures[index] = s;
        handler.push(clone);
    };

    const deleteStructure = (index: number) => {
        const filtered = handler.state.query.context.structures.filter((v, i) => i !== index);
        const clone = handler.copy();
        clone.query.context.structures = filtered;
        if (clone.files[index]) clone.files.splice(index, 1);
        handler.push(clone);
    };

    const updateStructureList = (index: number, o: StructureInputOption) => {
        const updated = [...structureList.slice(0, index), o, ...structureList.slice(index + 1)];
        setStructureList(updated);
    };

    const deleteFromStructureList = (index: number) => {
        const updated = [...structureList.slice(0, index), ...structureList.slice(index + 1)];
        setStructureList(updated);
    };

    const onMutation = (index: number, value?: string) => {
        if (!value) throw new Error('Undefined input option');
        const v = value as StructureInputOption;
        updateStructure(index, structureOptions[v]());
        updateStructureList(index, v);
    };

    const renderMutateAction = (index: number, text: string) => {
        return <SelectableControl
            component={<Icon
                svg={LineArrowDownSvg}
                title={text}
            />}
            options={Object.keys(structureOptions)}
            onClick={(value?: string) => onMutation(index, value)}
        />;
    };

    const renderMutateControls = (index: number) => {
        return <span>
            <DeleteActionControl
                info='Click to remove this item'
                className={classNames('upload-icon delete-icon')}
                onClick={() => {
                    deleteStructure(index);
                    deleteFromStructureList(index);
                }}
            />
            {renderMutateAction(index, 'Click to change an item type')}
        </span>;
    };

    const renderAddControls = () => {
        const count = structureList.length;
        const disabled = count === MAX_NUM_STRUCTURES;
        return <div className={horizontal}>
            {
                disabled &&
                <AddActionControl
                    info='Remove any of existing items to add a new one'
                    className='add-new-item-disabled'
                    onClick={() => {
                        //
                    }}
                />
            }
            {
                !disabled &&
                <div className='new-item-area'>
                    <AddActionControl
                        info='Click to add a new entry'
                        onClick={() => {
                            updateStructure(count, structureOptions['Entry ID']());
                            updateStructureList(count, 'Entry ID');
                        }}
                        className='add-new-item'
                    />
                    {renderMutateAction(count, 'Click to select a new item')}
                </div>
            }
        </div>;
    };

    const renderSelection = (index: number, type: 'input' | 'selection') => {
        const s = structure(handler.state, index);
        const sele = selection(s);

        const updateAsymId = (v: string) => {
            const next = handler.copy();
            selection(structure(next, index)).asym_id = v;
            handler.push(next);
        };

        const updateBegResId = (beg?: number) => {
            const next = handler.copy();
            selection(structure(next, index)).beg_seq_id = beg;
            handler.push(next);
        };

        const updateEndResId = (beg?: number) => {
            const next = handler.copy();
            selection(structure(next, index)).end_seq_id = beg;
            handler.push(next);
        };
        return <>
            {type === 'selection' &&
            <AsymSelectorComponent
                entry_id={(s as StructureEntry).entry_id}
                fetchFn={props.ctx.data().asymIds}
                value={sele.asym_id}
                onOptsAvailable={(v) => updateAsymId(v)}
                onChange={(v) => updateAsymId(v)}
            />}
            {type === 'input' &&
            <AsymInputComponent
                value={sele.asym_id}
                onChange={(v) => updateAsymId(v)}
            />}
            <ResidueInputComponent
                label='Beg'
                value={sele.beg_seq_id}
                isDisabled={!sele.asym_id}
                onChange={(v) => updateBegResId(Number(v))}
            />
            <ResidueInputComponent
                label='End'
                value={sele.end_seq_id}
                isDisabled={!sele.asym_id}
                onChange={(v) => updateEndResId(Number(v))}
            />
        </>;
    };

    const renderStructureEntry = (index: number) => {

        const s = structure(handler.state, index) as StructureEntry;

        const updateEntryId = (v: string) => {
            const next = handler.copy();
            (structure(next, index) as StructureEntry).entry_id = v;
            handler.push(next);
        };

        return <>
            <EntryInputComponent
                value={s.entry_id}
                label='Entry ID'
                suggestFn={props.ctx.search().suggestEntriesByID.bind(props.ctx.search())}
                onChange={(v) => updateEntryId(v)}
            />
            {renderSelection(index, 'selection')}
        </>;
    };

    const renderStructureUniprotId = (index: number) => {

        const updateStructureSelection = (v: string) => {
            const [entry_id, asym_id] = v.split('.');
            const next = handler.copy();
            const s = (structure(next, index) as StructureEntry);
            s.entry_id = entry_id;
            s.selection = {
                asym_id: asym_id
            };
            handler.push(next);
            updateStructureList(index, 'Entry ID');
        };

        return <>
            <StructureSelectorByUniprotId
                ctx={props.ctx}
                onChange={(v) => updateStructureSelection(v)}
            />
        </>;
    };

    const renderStructureAlphaFoldDb = (index: number) => {

        const updateStructureSelection = (v: string) => {

            const next = handler.copy();
            const s = (structure(next, index) as StructureWebLink);
            s.url = v;
            s.format = 'mmcif';
            s.selection = {
                asym_id: 'A'
            };
            handler.push(next);
            updateStructureList(index, 'File URL');
        };

        return <>
            <AlphaFoldDbStructureSelector
                ctx={props.ctx}
                onChange={(v) => updateStructureSelection(v)}
            />
        </>;
    };

    const renderStructureESMAtlas = (index: number) => {

        const updateStructureSelection = (v: string) => {

            const next = handler.copy();
            const s = (structure(next, index) as StructureWebLink);
            s.url = v;
            s.format = 'mmcif';
            s.selection = {
                asym_id: 'A'
            };
            handler.push(next);
            updateStructureList(index, 'File URL');
        };

        return <>
            <ESMAtlasStructureSelector
                ctx={props.ctx}
                onChange={(v) => updateStructureSelection(v)}
            />
        </>;
    };

    const renderStructureFileUpload = (index: number) => {

        const file = handler.state.files[index];

        const updateFile = (value: File) => {
            const next = handler.copy();
            (structure(next, index) as StructureFileUpload).format = guessFormat(value);
            next.files[index] = value;
            handler.push(next);
        };

        return <>
            <FileInputComponent
                value={file}
                onUpdate={(v) => updateFile(v)}
                onError={(message) => alert(message)}
            />
            {renderSelection(index, 'input')}
        </>;
    };

    const renderStructureWebLink = (index: number) => {

        const struct = structure(handler.state, index) as StructureWebLink;

        const updateURL = (v: string) => {
            const next = handler.copy();
            (structure(next, index) as StructureWebLink).url = v;
            handler.push(next);
        };

        const updateFormat = (v: string) => {
            const next = handler.copy();
            (structure(next, index) as StructureWebLink).format = v as StructureFileFormat;
            handler.push(next);
        };

        return <>
            <WebLinkInputComponent
                value={struct.url}
                onChange={(v) => updateURL(v)}
            />
            <FormatInputComponent
                value={struct.format}
                onChange={(v) => updateFormat(v)}
            />
            {renderSelection(index, 'input')}
        </>;
    };

    const renderStructureInputOption = (index: number, o: StructureInputOption) => {
        if (o === 'Entry ID')
            return renderStructureEntry(index);
        else if (o === 'File URL')
            return renderStructureWebLink(index);
        else if (o === 'File Upload')
            return renderStructureFileUpload(index);
        else if (o === 'UniProt ID')
            return renderStructureUniprotId(index);
        else if (o === 'AlphaFold DB')
            return renderStructureAlphaFoldDb(index);
        else if (o === 'ESMAtlas')
            return renderStructureESMAtlas(index);
    };

    const renderSelectedStructures = () => {
        return <>
            {structureList.map((s, i) => {
                if (s !== undefined) {
                    return <div key={i} className={horizontal}>
                        {renderMutateControls(i)}
                        {renderStructureInputOption(i, s)}
                    </div>;
                }
            })}
            {renderAddControls()}
        </>;
    };

    return (
        <div className='box-row'>
            <Collapse
                activeKey={activeKey}
                className='panel-input-form'
                onChange={(key: React.Key | React.Key[]) => {
                    updateKey(key as string[]);
                }}
            >
                <Panel header='Compare Protein Structures'>
                    <div className={vertical}>
                        {renderSelectedStructures()}
                        <br/>
                        <StructureAlignmentMethod ctx={handler} />
                        <div className={horizontal} style={{ justifyContent: 'flex-end' }}>
                            <ActionButtonControl
                                label='Compare'
                                isDisabled={!handler.state.isSubmittable()}
                                onClick={() => props.onSubmit(request)}
                                className={classNames('btn-action', 'btn-submit')}
                            />
                            <ActionButtonControl
                                label='Clear'
                                onClick={() => handler.clear()}
                                className={classNames('btn-action', 'btn-clear')}
                            />
                        </div>
                    </div>
                </Panel>
            </Collapse>
        </div>
    );
}

function structure(data: QueryRequest, index: number) {
    return data.query.context.structures[index];
}

function selection(data: Structure) {
    return data.selection as StructureInstanceSelection;
}

function guessFormat(file: File): StructureFileFormat {
    if (file.name.includes('.cif') || file.name.includes('.bcif'))
        return 'mmcif';
    else if (file.name.includes('.pdb') || file.name.includes('.ent'))
        return 'pdb';
    else throw new Error('Unsupported file format for: ' + file.name);
}
