/* eslint-disable @typescript-eslint/no-non-null-assertion */
import '../skin/modal.css';

import { useEffect, useState } from 'react';
import { Alignment } from '../../auto/alignment/alignment-response';
import { ApplicationContext } from '../../context';
import { DefaultOpasityValue, getAlignmentColorRgb } from '../../utils/color';
import { Icon, InfoCircleSvg } from '../icons';
import { getCombinedInstanceId, isValidEntryId } from '../../utils/identifier';
import InfoModal from './info';
import { InstanceData } from '../../service/data-service';

function round(value: number | undefined) {
    if (!value && value !== 0)
        return 'NA';
    return Math.round(value * 100) / 100;
}

function scores(alignment: Alignment) {

    const entryId = 'entry_id' in alignment.structures[1] ? alignment.structures[1]['entry_id'] : ('name' in alignment.structures[1] ? alignment.structures[1]['name'] : 'NA');
    const chainId = alignment.structures[1].selection && 'asym_id' in alignment.structures[1].selection ? alignment.structures[1].selection['asym_id'] : 'NA';
    const rmsd = alignment.summary?.scores?.find(s => s.type === 'RMSD')?.value;
    const tmscore = alignment.summary?.scores?.find(s => s.type === 'TM-score')?.value;
    const simscore = alignment.summary?.scores?.find(s => s.type === 'similarity-score')?.value;
    const identity = alignment.summary?.scores?.find(s => s.type === 'sequence-identity')?.value;
    const similarity = alignment.summary?.scores?.find(s => s.type === 'sequence-similarity')?.value;
    const length = alignment.summary?.n_aln_residue_pairs;
    const coverage = alignment.summary?.aln_coverage?.[1];
    const refCoverage = alignment.summary?.aln_coverage?.[0];
    const seqLength = alignment.sequence_alignment?.[1].sequence?.length;
    const modeledLength = alignment.summary?.n_modeled_residues?.[1];

    return { entryId, chainId, rmsd, tmscore, simscore, identity, similarity, length, coverage, refCoverage, seqLength, modeledLength };
}

function defined(num: number | number[] | undefined) {
    return (num !== undefined && (num as unknown as string) !== 'NA');
}

export function AlignmentScoresComponent(props: { ctx: ApplicationContext }) {

    const [data, setData] = useState<Alignment[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContent, setModalContent] = useState<InstanceData | undefined>(undefined);

    useEffect(() => {
        setData(props.ctx.state.data.response.state?.results ?? []);
    }, []);

    const openInfo = (entryId: string, asymId: string) => {
        const instanceId = getCombinedInstanceId(entryId, asymId);
        props.ctx.data().polymerInstances([instanceId])
            .then(arr => arr[0])
            .then(data => {
                setModalContent(data);
                setIsModalOpen(true);
            });
    };

    const closeInfo = () => {
        setIsModalOpen(false);
    };

    const showInfo = (entryId: string | undefined, asymId: string) => {
        if (entryId && isValidEntryId(entryId)) {
            return <Icon
                svg={InfoCircleSvg}
                title={''}
                className='info-icon'
                onClick={() => openInfo(entryId, asymId)}
            />;
        }
    };

    const showEntryId = (entryId: string | undefined) => {
        if (entryId && isValidEntryId(entryId)) {
            const ref = props.ctx.configs.environment.rcsbOrg + '/structure/' + entryId;
            return <a href={ref}>{entryId}</a>;
        }
        return entryId;
    };

    function showReference() {
        const alignment = data[0];
        if (!alignment)
            return <></>;
        const entryId = 'entry_id' in alignment.structures[0] ? alignment.structures[0]['entry_id'] : ('name' in alignment.structures[0] ? alignment.structures[0]['name'] : 'NA');
        const chainId = alignment.structures[0].selection && 'asym_id' in alignment.structures[0].selection ? alignment.structures[0].selection['asym_id'] : 'NA';
        const color = getAlignmentColorRgb(0, DefaultOpasityValue);
        const seqLength = alignment.sequence_alignment?.[0].sequence?.length;
        const modeledLength = alignment.summary?.n_modeled_residues?.[0];
        return (<tr>
            <td style={{ backgroundColor: color }}>{showInfo(entryId, chainId)}</td>
            <td style={{ paddingLeft: '10px' }}>{showEntryId(entryId)}</td>
            <td>{chainId}</td>
            <td> - </td>
            <td> - </td>
            <td> - </td>
            <td> - </td>
            <td>{defined(seqLength) ? seqLength : '-'}</td>
            <td>{defined(modeledLength) ? modeledLength : '-'}</td>
        </tr>);
    }

    const showScores = () => {
        return data.map((alignment, n)=>{
            const data = scores(alignment);
            const color = getAlignmentColorRgb(n + 1, DefaultOpasityValue);
            return (<tr key={n}>
                <td style={{ backgroundColor: color }}>{showInfo(data.entryId, data.chainId)}</td>
                <td style={{ paddingLeft: '10px' }}>{showEntryId(data.entryId)}</td>
                <td>{data.chainId}</td>
                <td>{defined(data.rmsd) ? round(data.rmsd) : '-'}</td>
                <td>{defined(data.tmscore) ? round(data.tmscore) : '-'}</td>
                <td>{defined(data.identity) ? (round(data.identity! * 100) !== 'NA' ? round(data.identity! * 100) + '%' : '-') : '-'} </td>
                <td>{defined(data.length) ? data.length : '-'}</td>
                <td>{defined(data.seqLength) ? data.seqLength : '-'}</td>
                <td>{defined(data.modeledLength) ? data.modeledLength : '-'}</td>
            </tr>);
        });
    };

    return (
        <div className='box-row'>
            <table className='tbl-members'>
                <thead>
                    <tr>
                        <th style={{ width: '36px', padding: 0 }}></th>
                        <th>Entry</th>
                        <th>Chain</th>
                        <th>RMSD</th>
                        <th>TM-score</th>
                        <th>Identity</th>
                        <th>Equivalent Residues</th>
                        <th>Sequence Length</th>
                        <th>Modelled Residues</th>
                    </tr>
                </thead>
                <tbody>
                    {showReference()}
                    {showScores()}
                </tbody>
            </table>
            <InfoModal
                isModalOpen={isModalOpen}
                modalContent={modalContent}
                onClose={closeInfo}
            />
        </div>
    );
}