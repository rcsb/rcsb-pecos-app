import React, { useState, useEffect } from 'react';

import * as c from '../../utils/constants';
import { deepEqual, hexToStyle } from '../../utils/common';
import { resultsToInfo } from '../../adapter/api-to-metadata';

export default React.memo(ViewMembersInfo, deepEqual);

function renderTable(data) {
    return data.map(function (value, index) {
        const fill = hexToStyle(c.colorPalette[index], 0.8);
        return (
            <tr key={index}>
                <td style={{ backgroundColor: fill }}></td>
                <td style={{ whiteSpace: 'nowrap', paddingLeft: '6px' }}>{value.id}</td>
                <td>{value.pdbx_description || 'N/A'}</td>
                <td>{value.rcsb_sample_sequence_length || 'N/A'}</td>
                <td>{value.modeled_length || 'N/A'}</td>
                <td>{value.coverage + '%' || 'N/A'}</td>
            </tr>
        );
    });
}

function ViewMembersInfo({ results }) {
    const [data, setData] = useState([]);

    useEffect(() => {
        const run = async () => {
            const data = await resultsToInfo(results[0]);
            setData(data);
        };
        run();
    }, []);

    return (

        <div className='box-row'>
            {data.length > 0 &&
        <table className='tbl-summary'>
            <thead>
                <tr>
                    <th style={{ width: '3px', padding: 0 }}></th>
                    <th>Structure</th>
                    <th>Description</th>
                    <th>Sequence Length</th>
                    <th>Modeled Residues</th>
                    <th>Coverage</th>
                </tr>
            </thead>
            <tbody>{renderTable(data)}</tbody>
        </table>
            }
        </div>

    );
}
