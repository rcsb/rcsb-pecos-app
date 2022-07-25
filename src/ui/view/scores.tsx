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
                        {data.rmsd && <th>RMSD</th>}
                        {data.tmscore && <th>TM-score</th>}
                        {data.simscore && <th>Score</th>}
                        {data.identity && <th>SI%</th>}
                        {data.similarity && <th>SS%</th>}
                        {data.length && <th>Length</th>}
                        {data.coverage && <th>Coverage (Query/Target)</th>}
                    </tr>
                </thead>
                <tbody>
                    <tr key={1}>
                        {data.rmsd && <td>{round(data.rmsd)}</td>}
                        {data.tmscore && <td>{round(data.tmscore)}</td>}
                        {data.simscore && <td>{round(data.simscore)}</td>}
                        {data.identity && <td>{round(data.identity * 100)}</td>}
                        {data.similarity && <td>{round(data.similarity * 100)}</td>}
                        {data.length && <td>{data.length}</td>}
                        {data.coverage && <td>{data.coverage[0]}% / {data.coverage[1]}%</td>}
                    </tr>
                </tbody>
            </table>
        </div>;
    }

    return <>{activeTarget !== undefined && showScores()}</>;
}