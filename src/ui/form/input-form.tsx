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
import { isEntry, isUploadedFile, isUrl, useObservable } from '../../utils/helper';

import {
    AsymInputComponent,
    ResidueInputComponent,
    AsymSelectorComponent,
    SelectOption
} from './base';

import {
    StructureInstanceSelection,
    StructureEntry,
    StructureFileUpload as CoordinatesByFileUpload,
    StructureWebLink,
    StructureFileFormat
} from '../../auto/alignment/alignment-request';

import {
    AutosuggestControl
} from '../controls/controls-input';
import { Icon, LineArrowDownSvg, PaperClipSvg, SolidArrowDownSvg, UploadSvg } from '../icons';
import { ApplicationContext } from '../../context';
import { isValidEntryId, isValidMgnifyId, isValidUniprotId } from '../../utils/identifier';
import Select from 'rc-select';
import { StructureAlignmentMethod } from './input-method';
import Upload, { UploadProps } from 'rc-upload';

type StructureImpl = StructureEntryImpl | StructureFileUploadImpl | StructureWebLinkImpl;
type StructureInputOption = 'rcsb-entry' | 'rcsb-uniprot' | 'file-url' | 'file-upload' | 'alphafold-db' | 'esm-atlas';
const structureOptions: { [key in StructureInputOption]: () => StructureImpl } = {
    'rcsb-entry': () => new StructureEntryImpl(),
    'rcsb-uniprot': () => new StructureEntryImpl(),
    'file-url': () => new StructureWebLinkImpl(),
    'file-upload': () => new StructureFileUploadImpl(),
    'alphafold-db': () => new StructureWebLinkImpl(),
    'esm-atlas': () => new StructureWebLinkImpl()
};

function RcsbEntryById(props: {
    ctx: ApplicationContext,
    value: string,
    onChange: (value: string) => void,
    suggestFn: (v: string) => Promise<string[]>
}) {
    return <div className='inp-outer'>
        <label className='inp-label'>Entry ID</label>
        <AutosuggestControl
            value={props.value}
            label={'3PQR, AF_AFP60325F1 '}
            onChange={props.onChange}
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
            <label className='inp-label'>UniProtKB ID</label>
            <AutosuggestControl
                value={uniprotId.toUpperCase() || ''}
                label={'P06213'}
                onChange={updateUniprotId}
                suggestHandler={props.ctx.search().suggestUniprotID.bind(props.ctx.search())}
                className={classNames('inp', 'inp-entry')}
            />
        </div>
        <div id='arrow-top' className='inp-outer inp-select'>
            <label className='inp-label'>Protein Chain</label>
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
                <label className='inp-label'>File</label>
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
            <label className='inp-label'>File</label>
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
            <label className='inp-label'>URL</label>
            <input
                type='text'
                value={props.value}
                placeholder='https://'
                onChange={(e) => props.onValueChange(e.target.value)}
                className={classNames('inp', 'inp-link')}
            />
        </div>
        <div className='inp-outer inp-format'>
            <label className='inp-label'>Format</label>
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

    return <div className='inp-outer'>
        <label className='inp-label'>AlphaFold DB: UniProtKB ID</label>
        <input
            type='text'
            value={uniprotId.toUpperCase() || ''}
            placeholder={'Q5VSL9'}
            className={classNames('inp', 'inp-entry')}
            onChange={(e) => updateUniprotId(e.target.value)}
        />
    </div>;
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

    return <div className='inp-outer'>
        <label className='inp-label'>ESM Atlas: MGnify Protein ID</label>
        <input
            type='text'
            value={mgnifyId.toUpperCase() || ''}
            placeholder={'MGYP001006757307'}
            className={classNames('inp', 'inp-entry')}
            onChange={(e) => updateMgnifyId(e.target.value)}
        />
    </div>;
}

export function StructureAlignmentInput(props: {
    ctx: ApplicationContext,
    onSubmit: (r: QueryRequest) => void,
    isCollapsed: boolean
}) {
    const [activeKey, setActiveKey] = useState<React.Key | React.Key[]>(['0']);
    useEffect(() => { if (props.isCollapsed) setActiveKey([]); }, [props.isCollapsed]);

    const handler = props.ctx.state.data.request;
    const [request, setRequest] = useState(handler.state);
    useObservable<QueryRequest>(handler.subject, setRequest);

    // Allow to add up to 10 structures to the alignment request
    const MAX_NUM_STRUCTURES = 10;
    const initStructureListState = (state: QueryRequest) => {
        const list = new Array<StructureInputOption>();
        state.query.context.structures.map((s, i) => {
            if (isEntry(s)) {
                list[i] = 'rcsb-entry';
            } else if (isUrl(s)) {
                list[i] = 'file-url';
            } else if (isUploadedFile(s)) {
                list[i] = 'file-upload';
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

        const options: SelectOption<StructureInputOption>[] = [
            {
                label: 'RCSB.org',
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
            if (typeof structureList[index] === 'undefined') {
                return '';
            } else {
                return structureList[index];
            }
        };

        return <Select
            value={toOptionSelection(index)}
            dropdownMatchSelectWidth={false}
            getRawInputElement={() => <Icon svg={LineArrowDownSvg} title={text}/>}
            options={options}
            onChange={(v?: string) => onMutation(index, v)}
        />;
    };

    const renderMutateControls = (index: number) => {
        return <span style={{ paddingTop: '25px' }}>
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
                            updateStructure(count, structureOptions['rcsb-entry']());
                            updateStructureList(count, 'rcsb-entry');
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

        const updateSelection = (entryId: string, asymId: string) => {
            const next = handler.copy();
            const sele = selection(structure(next, index));
            if (isValidEntryId(entryId)) {
                sele.asym_id = asymId;
                sele.beg_seq_id = 1;
                props.ctx.data().sequenceLength(entryId, asymId)
                    .then(resId => sele.end_seq_id = resId)
                    .then(() => handler.push(next));
            }
        };

        const updateAsymId = (asymId: string) => {
            const next = handler.copy();
            selection(structure(next, index)).asym_id = asymId;
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
            <div className='inp-outer'>
                <label className='inp-label'>Chain ID</label>
                {type === 'selection' &&
                <AsymSelectorComponent
                    entry_id={(s as StructureEntry).entry_id}
                    fetchFn={props.ctx.data().asymIds}
                    value={sele.asym_id}
                    onOptsAvailable={(asymId) => updateSelection((s as StructureEntry).entry_id, asymId)}
                    onChange={(asymId) => updateSelection((s as StructureEntry).entry_id, asymId)}
                />}
                {type === 'input' &&
                <AsymInputComponent
                    value={sele.asym_id}
                    label='A'
                    onChange={(v) => updateAsymId(v)}
                />}
            </div>
            <div className='inp-outer'>
                <label className='inp-label'>Begin</label>
                <ResidueInputComponent
                    value={sele.beg_seq_id}
                    isDisabled={!sele.asym_id}
                    onChange={(v) => updateBegResId(Number(v))}
                />
            </div>
            <div className='inp-outer'>
                <label className='inp-label'>End</label>
                <ResidueInputComponent
                    value={sele.end_seq_id}
                    isDisabled={!sele.asym_id}
                    onChange={(v) => updateEndResId(Number(v))}
                />
            </div>
        </>;
    };

    const renderRcsbEntryOption = (index: number) => {

        const s = structure(handler.state, index) as StructureEntry;

        const updateEntryId = (v: string) => {
            const next = handler.copy();
            (structure(next, index) as StructureEntry).entry_id = v;
            if (!isValidEntryId(v)) {
                const sele = selection(structure(next, index));
                sele.asym_id = '';
                sele.beg_seq_id = undefined;
                sele.end_seq_id = undefined;
            }
            handler.push(next);
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
            const next = handler.copy();
            const s = (structure(next, index) as StructureEntry);
            s.entry_id = entry_id;
            s.selection = {
                asym_id: asym_id
            };
            handler.push(next);
            updateStructureList(index, 'rcsb-entry');
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
            const next = handler.copy();
            const s = (structure(next, index) as StructureWebLink);
            s.url = v;
            s.format = 'mmcif';
            s.selection = {
                asym_id: 'A'
            };
            handler.push(next);
            updateStructureList(index, 'file-url');
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
            const next = handler.copy();
            const s = (structure(next, index) as StructureWebLink);
            s.url = v;
            s.format = 'mmcif';
            s.selection = {
                asym_id: 'A'
            };
            handler.push(next);
            updateStructureList(index, 'file-url');
        };

        return <>
            <ESMAtlasEntryByMGnifyId
                ctx={props.ctx}
                onChange={(v) => update(v)}
            />
        </>;
    };

    const renderFileUploadOption = (index: number) => {

        const file = handler.state.files[index];

        const updateFile = (value: File) => {
            const next = handler.copy();
            (structure(next, index) as CoordinatesByFileUpload).format = guessFormat(value);
            next.files[index] = value;
            handler.push(next);
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
            {structureList.map((s, i) => {
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
        handler.clear();
        setStructureList(initStructureListState(handler.state));
    };

    const alignmentTool = () => {
        return <div className={vertical}>
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
