/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useState, useEffect } from 'react';

import { ApplicationContext } from '../../context';
import { ColorLists, convertHexToRgb } from '../../utils/color';

import { Alignment, StructureInstanceSelection } from '../../auto/alignment/alignment-response';
import { getCombinedInstanceIds, createInstanceLabel } from '../../utils/identifier';
import { DataProvider, InstanceData } from '../../provider/data-provider';
import { isEntry } from '../../utils/helper';

type MemberInfo = InstanceData & {
    modeled_residues_length: number
};

async function getMembersInfo(results: Alignment[], data: DataProvider) {

    const ids = getCombinedInstanceIds(results);
    const instances = await data.polymerInstances(ids);

    const info: MemberInfo[] = [];
    for (let k = 0; k < results.length; k++) {
        const alignment = results[k];
        for (let i = 0; i < alignment.structures.length; i++) {
            if (k === 0 && i === 0 || i > 0) {
                const s = alignment.structures[i];
                const name = isEntry(s) ? s.entry_id : s.name || 'N/A';
                const sele = s.selection as StructureInstanceSelection;
                const filtered = instances.filter(d => d.entry_id === name && d.asym_id === sele.asym_id);
                const instance = filtered.length > 0 ? filtered[0] : null;
                info.push({
                    entry_id: name,
                    asym_id: sele.asym_id,
                    auth_asym_id: instance?.auth_asym_id,
                    pdbx_description: instance?.pdbx_description,
                    rcsb_sample_sequence_length: instance?.rcsb_sample_sequence_length || alignment.sequence_alignment![i].sequence?.length,
                    ncbi_scientific_name: instance?.ncbi_scientific_name,
                    modeled_residues_length: alignment.summary!.n_modeled_residues![i]
                });
            }
        }
    }
    return info;
}

export function MembersInfoComponent(props: { ctx: ApplicationContext }) {

    const [data, setData] = useState<MemberInfo[]>([]);
    const [activeView, setActiveView] = useState<number>(props.ctx.state.events.target.getValue());

    useEffect(() => {
        const run = async () => {
            const results = props.ctx.state.data.response.state?.results || [];
            const data = await getMembersInfo(results, props.ctx.data());
            setData(data);
        };
        run();
    }, []);

    function select(activeView: number) {
        setActiveView(activeView);
        props.ctx.state.events.target.next(activeView);
    }

    function view(index: number) {
        if (index === 0) {
            return <input type='radio' disabled />;
        } else {
            return <input type='radio'
                checked={activeView === index - 1}
                onChange={() => select(index - 1)} />;
        }
    }

    function members(data: MemberInfo[]) {
        return data.map(function (member, index) {
            const color = convertHexToRgb(ColorLists['set-1'][index], 0.8);
            return (
                <tr key={index}>
                    <td style={{ backgroundColor: color }}></td>
                    <td style={{ whiteSpace: 'nowrap', paddingLeft: '6px' }}>{member.entry_id}</td>
                    <td>{createInstanceLabel(member.asym_id, member.auth_asym_id)}</td>
                    <td>{member.pdbx_description || 'N/A'}</td>
                    <td>{member.ncbi_scientific_name || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>{member.rcsb_sample_sequence_length || 'N/A'}</td>
                    <td style={{ textAlign: 'center' }}>{member.modeled_residues_length}</td>
                    <td style={{ textAlign: 'center' }}>{view(index)}</td>
                </tr>
            );
        });
    }

    return <div className='box-row'>
        {data.length > 0 &&
        <table className='tbl-members'>
            <thead>
                <tr>
                    <th style={{ width: '3px', padding: 0 }}></th>
                    <th>Entry ID</th>
                    <th>Chain ID</th>
                    <th>Description</th>
                    <th>Organism</th>
                    <th style={{ textAlign: 'center' }}>Sequence Length</th>
                    <th style={{ textAlign: 'center' }}>Modeled Residues</th>
                    <th style={{ textAlign: 'center' }}>View Sequence</th>
                </tr>
            </thead>
            <tbody>{members(data)}</tbody>
        </table>
        }
    </div>;
}
