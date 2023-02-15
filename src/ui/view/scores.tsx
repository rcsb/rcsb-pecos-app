/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { Alignment } from '../../auto/alignment/alignment-response';
import { ApplicationContext } from '../../context';
import {ColorLists, convertHexToRgb} from "../../utils/color";

function round(value: number | undefined) {
    if (!value)
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

    return { entryId, chainId, rmsd, tmscore, simscore, identity, similarity, length, coverage };
}

function defined(num: number | number[] | undefined) {
    return num !== undefined;
}

export function AlignmentScoresComponent(props: { ctx: ApplicationContext }) {

    const [data, setData] = useState<Alignment[]>([]);

    useEffect(() => {
        setData(props.ctx.state.data.response.state?.results ?? [])
    }, []);

    function showScores() {
        return data.map((alignment, n)=>{
            const data = scores(alignment);
            const color = convertHexToRgb(ColorLists['set-1'][n + 1], 0.8);
            return (<tr key={n}>
                <td style={{ backgroundColor: color }}></td>
                <td>{data.entryId}</td>
                <td>{data.chainId}</td>
                <td>{round(data.rmsd!)}</td>
                <td>{round(data.tmscore!)}</td>
                <td>{round(data.identity! * 100)}%</td>
                <td>{data.length}</td>
                <td>{data.coverage}%</td>
            </tr>)
        })
    }
    function showReference() {
        const alignment = data[0];
        if (!alignment)
            return <></>;
        const entryId = 'entry_id' in alignment.structures[0] ? alignment.structures[0]['entry_id'] : ('name' in alignment.structures[0] ? alignment.structures[0]['name'] : 'NA');
        const chainId = alignment.structures[0].selection && 'asym_id' in alignment.structures[0].selection ? alignment.structures[0].selection['asym_id'] : 'NA';
        const color = convertHexToRgb(ColorLists['set-1'][0], 0.8);
        return (<tr>
            <td style={{ backgroundColor: color }}></td>
            <td>{entryId}</td>
            <td>{chainId}</td>
            <td> - </td>
            <td> - </td>
            <td> - </td>
            <td> - </td>
            <td> - </td>
        </tr>)
    }

    return (<div className='box-row'><table className='tbl-members'>
        <thead>
            <tr>
                <th style={{ width: '3px', padding: 0 }}></th>
                <th>Entry ID</th>
                <th>Chain ID</th>
                <th>RMSD</th>
                <th>TM-SCORE</th>
                <th>IDENTITY</th>
                <th>LENGTH</th>
                <th>COVERAGE</th>
            </tr>
        </thead>
        <tbody>
            {showReference()}
            {showScores()}
        </tbody>
    </table></div>);
}