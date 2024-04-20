/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '../skin/collapse.css';
import classNames from 'classnames';

import React, { useEffect, useState } from 'react';
import Collapse, { CollapseProps } from 'rc-collapse';

import {
    QueryRequest,
    Structure,
    StructureEntryImpl,
    StructureWebLinkImpl,
    StructureFileUploadImpl
} from '../../utils/request';

import { ActionButtonControl } from '../controls/controls-button';
import { AddActionControl, DeleteActionControl } from '../controls/controls-action';

import { horizontal, vertical } from '../../utils/constants';
import { getPositiveNumber, updateWindowURL, useObservable } from '../../utils/helper';

import {
    TextInputComponent,
    IntegerInputComponent,
    AsymSelectorComponent,
    SelectOption,
    AutosuggestComponent
} from './base';

import {
    StructureInstanceSelection,
    StructureEntry,
    StructureFileUpload as CoordinatesByFileUpload,
    StructureWebLink,
    StructureFileFormat
} from '../../auto/alignment/alignment-request';

import { Icon, LineArrowDownSvg, PaperClipSvg, SolidArrowDownSvg, UploadSvg } from '../icons';
import { ApplicationContext } from '../../context';
import { isValidEntryId, isValidMgnifyId, isValidUniprotId } from '../../utils/identifier';
import Select from 'rc-select';
import { StructureAlignmentMethod } from './input-method';
import Upload, { UploadProps } from 'rc-upload';
import { StructureInputOption } from '../../state/option';

type StructureImpl = StructureEntryImpl | StructureFileUploadImpl | StructureWebLinkImpl;

const optionsToStructure: { [key in StructureInputOption]: () => StructureImpl } = {
    'rcsb-entry': () => new StructureEntryImpl(),
    'rcsb-uniprot': () => new StructureEntryImpl(),
    'file-url': () => new StructureWebLinkImpl(),
    'file-upload': () => new StructureFileUploadImpl(),
    'alphafold-db': () => new StructureWebLinkImpl(),
    'esm-atlas': () => new StructureWebLinkImpl()
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Example(props: {value: string, onClick: () => void}) {
    return <span style={ { paddingTop: '16px' } }>
        Try an example: <span
            style={ { cursor: 'pointer', fontStyle: 'italic' } }
            onClick={props.onClick}>
            <u>{props.value}</u>
        </span>
    </span>;
}

function RcsbEntryById(props: {
    ctx: ApplicationContext,
    value: string,
    onChange: (value: string) => void,
    suggestFn: (v: string) => Promise<string[]>
}) {
    return <div className='inp-outer'>
        <span className='inp-label'>RCSB PDB: Entry ID</span>
        <AutosuggestComponent
            value={props.value || ''}
            label={'e.g., 3PQR, AF_AFP60325F1 '}
            onChange={props.onChange}
            suggestDebounceMs={props.ctx.configs.service.search.suggestDebounceMs}
            suggestHandler={props.suggestFn}
            className={classNames('inp', 'inp-entry')}
        />
    </div>;
}

function RcsbEntryByUniprotId(props: {
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
        <div className='inp-outer'>
            <span className='inp-label'>RCSB PDB: UniProtKB ID</span>
            <AutosuggestComponent
                value={uniprotId.toUpperCase() || ''}
                label={'e.g., P06213'}
                onChange={updateUniprotId}
                suggestDebounceMs={props.ctx.configs.service.search.suggestDebounceMs}
                suggestHandler={props.ctx.search().suggestUniprotID.bind(props.ctx.search())}
                className={classNames('inp', 'inp-entry')}
            />
        </div>
        <div id='arrow-top' className='inp-outer inp-select'>
            <span className='inp-label'>Protein Chain</span>
            <Select
                value={'Select chain'}
                dropdownMatchSelectWidth={false}
                suffixIcon={() => SolidArrowDownSvg('20', '20', '5 3 20 20')}
                options={options}
                disabled={options.length === 0}
                onChange={props.onChange}
            />
        </div>
    </>;
}

function CoordinatesByFileUpload(props: {
    value: File
    onChange: (value: File) => void;
    onError: (mesage: string) => void;
}) {
    const acceptFormats = ['cif', 'bcif', 'pdb', 'ent'];
    if (!props.value) {
        const uploadProps: UploadProps = {
            beforeUpload: (file) => {
                const name = file.name.toLowerCase();
                if (isValidFormat(name, acceptFormats, false)) {
                    props.onChange(file);
                } else {
                    props.onError('File format is not supported. Allowed formats: ' + acceptFormats);
                }
                return false;
            }
        };

        const isValidFormat = (name: string, allowedFormats: string[], allowCompressed = false): boolean => {
            let isValid = false;
            for (const format of allowedFormats) {
                isValid = isValid || name.endsWith(format);
                if (allowCompressed)
                    isValid = isValid || name.endsWith(format + '.gz');
            }
            return isValid;
        };

        return (
            <div className='inp-outer'>
                <span className='inp-label'>File</span>
                <Upload style={{ outline: 'none' }} {...uploadProps}>
                    <button className={'btn-upload'}>
                        <Icon
                            svg={UploadSvg}
                        />
                        <span className='btn-upload-label'>{'Upload File'}</span>
                    </button>
                </Upload>
            </div>
        );
    } else {
        return <div className='inp-outer'>
            <span className='inp-label'>File</span>
            <div style={{ display: 'inline' }}>
                <span style={{ padding: '3px' }}>{props.value.name}</span>
                <Icon
                    svg={PaperClipSvg}
                    className='upload-icon'
                />
            </div>
        </div>;
    }
}

function CoordinatesByWebLink(props: {
    value: string,
    format: string,
    onValueChange: (value: string) => void,
    onFormatChange: (value: string) => void,
}) {
    const options: SelectOption<StructureFileFormat>[] = [
        {
            label: 'mmCIF',
            value: 'mmcif'
        },
        {
            label: 'PDB',
            value: 'pdb'
        }
    ];
    return <>
        <div className='inp-outer'>
            <span className='inp-label'>URL</span>
            <input
                id='input-area'
                type='text'
                value={props.value}
                placeholder='https://'
                onChange={(e) => props.onValueChange(e.target.value)}
                className={classNames('inp', 'inp-link')}
            />
        </div>
        <div className='inp-outer inp-format'>
            <span className='inp-label'>Format</span>
            <Select
                value={props.format}
                suffixIcon={() => SolidArrowDownSvg('20', '20', '5 3 20 20')}
                placeholder='Format'
                options={options}
                onChange={props.onFormatChange}
            />
        </div>
    </>;
}

function AlphaFoldEntryByUniprtId(props: {
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

    return <>
        <div className='inp-outer'>
            <span className='inp-label'>AlphaFold DB: UniProtKB ID</span>
            <input
                id='input-area'
                type='text'
                value={uniprotId.toUpperCase() || ''}
                placeholder={'e.g., Q5VSL9'}
                className={classNames('inp', 'inp-entry')}
                onChange={(e) => updateUniprotId(e.target.value)}
            />
        </div>
        <Example
            value={'F20H23.2 protein from Arabidopsis thaliana'}
            onClick={() => updateUniprotId('Q9S828')}
        />
    </>;
}

function ESMAtlasEntryByMGnifyId(props: {
    ctx: ApplicationContext,
    onChange: (value: string) => void
}) {
    const [mgnifyId, updateMgnifyId] = useState('');
    useEffect(() => { getESMAtlasStructureByMgnifyId(); }, [mgnifyId]);

    // https://api.esmatlas.com/fetchPredictedStructure/MGYP001006757307.cif
    const base = 'https://api.esmatlas.com/fetchPredictedStructure/';
    const getESMAtlasStructureByMgnifyId = async () => {
        if (isValidMgnifyId(mgnifyId)) {
            const url = base + mgnifyId + '.cif';
            props.onChange(url);
        }
    };

    return <>
        <div className='inp-outer'>
            <span className='inp-label'>ESM Atlas: MGnify ID</span>
            <input
                id='input-area'
                type='text'
                value={mgnifyId.toUpperCase() || ''}
                placeholder={'e.g., MGYP001006757307'}
                className={classNames('inp', 'inp-entry')}
                onChange={(e) => updateMgnifyId(e.target.value)}
            />
        </div>
        <Example
            value={'MGYP001006757307'}
            onClick={() => updateMgnifyId('MGYP001006757307')}
        />
    </>;
}

export function StructureAlignmentInput(props: {
    ctx: ApplicationContext,
    onSubmit: (r: QueryRequest) => void,
    isCollapsed: boolean
}) {
    const [activeKey, setActiveKey] = useState<React.Key | React.Key[]>(['0']);
    useEffect(() => { if (props.isCollapsed) setActiveKey([]); }, [props.isCollapsed]);

    const requestCtx = props.ctx.state.data.request;
    const [request, setRequest] = useState(requestCtx.state);
    useObservable<QueryRequest>(requestCtx.subject, setRequest);

    const optionsCtx = props.ctx.state.data.options;
    const [structureOptions, setStructureOptions] = useState(optionsCtx.state);
    useObservable<StructureInputOption[]>(optionsCtx.subject, setStructureOptions);

    const updateOption = (index: number, o: StructureInputOption, s: Structure) => {
        const clone = requestCtx.copy();
        clone.query.context.structures[index] = s;
        requestCtx.push(clone);
        optionsCtx.push(o, index);
    };

    const deleteOption = (index: number) => {
        const filtered = requestCtx.state.query.context.structures.filter((v, i) => i !== index);
        const clone = requestCtx.copy();
        clone.query.context.structures = filtered;
        if (clone.files[index]) clone.files.splice(index, 1);
        requestCtx.push(clone);
        optionsCtx.remove(index);
    };

    const onMutation = (index: number, value?: string) => {
        if (!value) throw new Error('Undefined input option');
        const o = value as StructureInputOption;
        const s = optionsToStructure[o]();
        updateOption(index, o, s);
    };

    const renderMutateAction = (index: number, text: string) => {

        const options: SelectOption<StructureInputOption>[] = [
            {
                label: 'RCSB PDB',
                options: [
                    {
                        label: 'Entry ID',
                        value: 'rcsb-entry',
                        title: 'Enter PDB or Computed Structure Model (CSM) ID'
                    },
                    {
                        label: 'UniProt ID',
                        value: 'rcsb-uniprot',
                        title: 'Enter UniProtKB ID for seuences with known 3D structure'
                    }
                ]
            },
            {
                label: 'External Sources',
                options: [
                    {
                        label: 'AlphaFold DB',
                        value: 'alphafold-db',
                        title: 'Enter UniProtKB ID to fetch a structure from AlphaFold Protein Structure Database'
                    },
                    {
                        label: 'ESMAtlas',
                        value: 'esm-atlas',
                        title: 'Enter MGnify protein ID from the MGnify protein sequence database to fetch a structure from ESM Metagenomic Atlas'
                    },
                    {
                        label: 'File Upload',
                        value: 'file-upload',
                        title: 'Upload a file containing atomic structure coordinates in one of the followiing formats: PDBx/mmCIF, BinaryCIF, and Legacy PDB'
                    },
                    {
                        label: 'File URL',
                        value: 'file-url',
                        title: 'Reference atomic structure coordinates by providing a URL to a file'
                    }
                ]
            }
        ];

        const toOptionSelection = (index: number) => {
            if (typeof structureOptions[index] === 'undefined') {
                return '';
            } else {
                return structureOptions[index];
            }
        };

        return <span className={classNames('dropdown', 'new-item-select')}>
            <Select
                value={toOptionSelection(index)}
                dropdownMatchSelectWidth={false}
                getRawInputElement={() => <span title={text}><LineArrowDownSvg/></span>}
                options={options}
                onChange={(v?: string) => onMutation(index, v)}
            />
        </span>;
    };

    const renderMutateControls = (index: number) => {
        return <span style={{ paddingTop: '25px' }}>
            <DeleteActionControl
                info='Click to remove this input'
                className={classNames('upload-icon delete-icon')}
                onClick={() => {
                    deleteOption(index);
                }}
            />
            {renderMutateAction(index, 'Click to change an input type')}
        </span>;
    };

    const renderAddControls = () => {
        const count = structureOptions.length;
        const disabled = count === props.ctx.configs.service.alignment.maxNumStructuresPairwise;
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
                <span style={{ marginTop: '20px' }}>
                    <AddActionControl
                        info='Click to add a new Entry ID input'
                        onClick={() => {
                            const o = 'rcsb-entry';
                            const s = optionsToStructure[o]();
                            updateOption(count, o, s);
                        }}
                        className='add-new-item'
                    />
                    {renderMutateAction(count, 'Click to select a new input')}
                </span>
            }
        </div>;
    };

    const renderSelection = (index: number, type: 'input' | 'selection') => {
        const s = structure(requestCtx.state, index);
        const sele = selection(s);

        const updateSelection = (entryId: string, asymId: string) => {
            const next = requestCtx.copy();
            const sele = selection(structure(next, index));
            if (isValidEntryId(entryId)) {
                sele.asym_id = asymId;
                sele.beg_seq_id = 1;
                props.ctx.data().sequenceLength(entryId, asymId)
                    .then(resId => sele.end_seq_id = resId)
                    .then(() => requestCtx.push(next));
            }
        };

        const updateAsymId = (asymId: string) => {
            const next = requestCtx.copy();
            selection(structure(next, index)).asym_id = asymId;
            requestCtx.push(next);
        };

        const updateBegResId = (val?: number) => {
            const next = requestCtx.copy();
            selection(structure(next, index)).beg_seq_id = getPositiveNumber(val);
            requestCtx.push(next);
        };

        const updateEndResId = (val?: number) => {
            const next = requestCtx.copy();
            selection(structure(next, index)).end_seq_id = getPositiveNumber(val);
            requestCtx.push(next);
        };

        return <>
            <div className='inp-outer'>
                <span className='inp-label'>Chain ID</span>
                {type === 'selection' &&
                <AsymSelectorComponent
                    entry_id={(s as StructureEntry).entry_id || ''}
                    fetchFn={props.ctx.data().asymIds}
                    value={sele.asym_id}
                    onOptsAvailable={(asymId) => updateSelection((s as StructureEntry).entry_id, asymId)}
                    onChange={(asymId) => updateSelection((s as StructureEntry).entry_id, asymId)}
                />}
                {type === 'input' &&
                <TextInputComponent
                    value={sele.asym_id}
                    label='e.g., A'
                    onChange={(v) => updateAsymId(v)}
                />}
            </div>
            <div className='inp-outer'>
                <span className='inp-label'>Begin</span>
                <IntegerInputComponent
                    value={sele.beg_seq_id}
                    isDisabled={!sele.asym_id}
                    onChange={(v) => updateBegResId(Number(v))}
                />
            </div>
            <div className='inp-outer'>
                <span className='inp-label'>End</span>
                <IntegerInputComponent
                    value={sele.end_seq_id}
                    isDisabled={!sele.asym_id}
                    onChange={(v) => updateEndResId(Number(v))}
                />
            </div>
        </>;
    };

    const renderRcsbEntryOption = (index: number) => {

        const s = structure(requestCtx.state, index) as StructureEntry;
        const updateEntryId = (v: string) => {
            const next = requestCtx.copy();
            (structure(next, index) as StructureEntry).entry_id = v;
            if (!isValidEntryId(v)) {
                const sele = selection(structure(next, index));
                sele.asym_id = '';
                sele.beg_seq_id = undefined;
                sele.end_seq_id = undefined;
            }
            requestCtx.push(next);
        };

        return <>
            <RcsbEntryById
                ctx={props.ctx}
                value={s.entry_id}
                suggestFn={props.ctx.search().suggestEntriesByID.bind(props.ctx.search())}
                onChange={(v) => updateEntryId(v)}
            />
            {renderSelection(index, 'selection')}
        </>;
    };

    const renderUniprotIdOption = (index: number) => {
        const updateStructureSelection = (v: string) => {
            const [entry_id, asym_id] = v.split('.');

            const s = new StructureEntryImpl();
            s.entry_id = entry_id;

            props.ctx.data().sequenceLength(entry_id, asym_id)
                .then(resId => {
                    s.selection = { asym_id: asym_id,
                        beg_seq_id: 1,
                        end_seq_id: resId
                    };
                })
                .then(() => {
                    updateOption(index, 'rcsb-entry', s);
                });
        };

        return <>
            <RcsbEntryByUniprotId
                ctx={props.ctx}
                onChange={(v) => updateStructureSelection(v)}
            />
        </>;
    };

    const renderAlphaFoldDbOption = (index: number) => {

        const update = (v: string) => {
            const s = new StructureWebLinkImpl();
            s.url = v;
            s.format = 'mmcif';
            s.selection = {
                asym_id: 'A'
            };
            updateOption(index, 'file-url', s);
        };

        return <>
            <AlphaFoldEntryByUniprtId
                ctx={props.ctx}
                onChange={(v) => update(v)}
            />
        </>;
    };

    const renderESMAtlasOption = (index: number) => {

        const update = (v: string) => {
            const s = new StructureWebLinkImpl();
            s.url = v;
            s.format = 'mmcif';
            s.selection = {
                asym_id: 'A'
            };
            updateOption(index, 'file-url', s);
        };

        return <>
            <ESMAtlasEntryByMGnifyId
                ctx={props.ctx}
                onChange={(v) => update(v)}
            />
        </>;
    };

    const renderFileUploadOption = (index: number) => {
        const file = requestCtx.state.files[index];
        const updateFile = (value: File) => {
            const next = requestCtx.copy();
            (structure(next, index) as CoordinatesByFileUpload).format = guessFormat(value);
            next.files[index] = value;
            requestCtx.push(next);
        };

        return <>
            <CoordinatesByFileUpload
                value={file}
                onChange={(v) => updateFile(v)}
                onError={(message) => alert(message)}
            />
            {renderSelection(index, 'input')}
        </>;
    };

    const renderWebLinkOption = (index: number) => {

        const struct = structure(requestCtx.state, index) as StructureWebLink;

        const updateURL = (v: string) => {
            const next = requestCtx.copy();
            (structure(next, index) as StructureWebLink).url = v;
            requestCtx.push(next);
        };

        const updateFormat = (v: string) => {
            const next = requestCtx.copy();
            (structure(next, index) as StructureWebLink).format = v as StructureFileFormat;
            requestCtx.push(next);
        };

        return <>
            <CoordinatesByWebLink
                value={struct.url}
                format={struct.format}
                onValueChange={(v) => updateURL(v)}
                onFormatChange={(v) => updateFormat(v)}
            />
            {renderSelection(index, 'input')}
        </>;
    };

    const renderOption = (index: number, o: StructureInputOption) => {
        if (o === 'rcsb-entry')
            return renderRcsbEntryOption(index);
        else if (o === 'rcsb-uniprot')
            return renderUniprotIdOption(index);
        else if (o === 'file-url')
            return renderWebLinkOption(index);
        else if (o === 'file-upload')
            return renderFileUploadOption(index);
        else if (o === 'alphafold-db')
            return renderAlphaFoldDbOption(index);
        else if (o === 'esm-atlas')
            return renderESMAtlasOption(index);
    };

    const renderSelectedStructures = () => {
        return <>
            {structureOptions.map((s, i) => {
                if (s !== undefined) {
                    return <div key={i} className={horizontal}>
                        {renderMutateControls(i)}
                        {renderOption(i, s)}
                    </div>;
                }
            })}
            {renderAddControls()}
        </>;
    };

    const clearForm = () => {
        requestCtx.clear();
        optionsCtx.clear();
        updateWindowURL();
    };

    const alignmentTool = () => {
        return <div className={vertical}>
            {renderSelectedStructures()}
            <br/>
            <StructureAlignmentMethod ctx={requestCtx} />
            <div className={horizontal} style={{ justifyContent: 'flex-end' }}>
                <ActionButtonControl
                    label='Compare'
                    isDisabled={!requestCtx.state.isSubmittable()}
                    onClick={() => props.onSubmit(request)}
                    className={classNames('btn-action', 'btn-submit')}
                />
                <ActionButtonControl
                    label='Clear'
                    onClick={() => clearForm()}
                    className={classNames('btn-action', 'btn-clear')}
                />
            </div>
        </div>;
    };

    const items: CollapseProps['items'] = [
        {
            label: 'Compare Protein Structures',
            children: alignmentTool()
        }
    ];

    return (
        <div className='box-row'>
            <Collapse
                activeKey={activeKey}
                className='panel-input-form'
                onChange={setActiveKey}
                items={items}
            >
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
