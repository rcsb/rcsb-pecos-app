/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { Alignment } from '../../auto/alignment/alignment-response';
import { ApplicationContext } from '../../context';

function round(value: number) {
    return Math.round(value * 100) / 100;
}

function scores(alignment: Alignment) {

    const rmsd = alignment.summary?.scores?.find(s => s.type === 'RMSD')?.value;
    const tmscore = alignment.summary?.scores?.find(s => s.type === 'TM-score')?.value;
    const simscore = alignment.summary?.scores?.find(s => s.type === 'similarity-score')?.value;
    const identity = alignment.summary?.scores?.find(s => s.type === 'sequence-identity')?.value;
    const similarity = alignment.summary?.scores?.find(s => s.type === 'sequence-similarity')?.value;
    const length = alignment.summary?.n_aln_residue_pairs;
    const coverage = alignment.summary?.aln_coverage;

    return { rmsd, tmscore, simscore, identity, similarity, length, coverage };
}

function defined(num: number | number[] | undefined) {
    return num !== undefined;
}

export function AlignmentScoresComponent(props: { ctx: ApplicationContext }) {

    const subs: Subscription[] = [];
    const [activeTarget, setTarget] = useState<number>();

    useEffect(() => {
        subs.push(props.ctx.state.events.target.subscribe((e) => setTarget(e)));
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    function showScores() {
        const results = props.ctx.state.data.response.state!.results![activeTarget!];
        const data = scores(results);
        return <div style={{ height: '80px' }}>
            <table className='tbl-scores'>
                <thead>
                    <tr key={0}>
                        {defined(data.rmsd) && <th>RMSD</th>}
                        {defined(data.tmscore) && <th>TM-score</th>}
                        {defined(data.simscore) && <th>Score</th>}
                        {defined(data.identity) && <th>SI%</th>}
                        {defined(data.similarity) && <th>SS%</th>}
                        {defined(data.length) && <th>Length</th>}
                        {defined(data.coverage) && <th>Coverage</th>}
                    </tr>
                </thead>
                <tbody>
                    <tr key={1}>
                        {defined(data.rmsd) && <td>{round(data.rmsd!)}</td>}
                        {defined(data.tmscore) && <td>{round(data.tmscore!)}</td>}
                        {defined(data.simscore) && <td>{round(data.simscore!)}</td>}
                        {defined(data.identity) && <td>{round(data.identity! * 100)}</td>}
                        {defined(data.similarity) && <td>{round(data.similarity! * 100)}</td>}
                        {defined(data.length) && <td>{data.length}</td>}
                        {defined(data.coverage) && <td>{data.coverage![0]}% / {data.coverage![1]}%</td>}
                    </tr>
                </tbody>
            </table>
        </div>;
    }

    return <>{activeTarget !== undefined && showScores()}</>;
}