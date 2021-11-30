import React from 'react'
import { deepEqual } from '../../utils/common'

export default React.memo(ViewAlignmentStats, deepEqual);

function ViewAlignmentStats({ data }) {

  const { rmsd, tmscore, simscore, identity, similarity, length } = unwind(data);
  
  function unwind(data) {
    const rmsd = data.scores.find((s) => s.type === 'RMSD');
    const tmscore = data.scores.find((s) => s.type === 'TM-score');
    const simscore = data.scores.find((s) => s.type === 'similarity-score');
    const identity = data.scores.find((s) => s.type === 'sequence-identity');
    const similarity = data.scores.find((s) => s.type === 'sequence-similarity');
    const length = data.length;
    return { rmsd, tmscore, simscore, identity, similarity, length }
  }

  function renderTableHeader() {
    return (
      <tr key={0}>
        {rmsd !== undefined && <th>RMSD</th>}
        {tmscore && <th>TM-score</th>}
        {simscore && <th>Score</th>}
        {identity && <th>SI%</th>}
        {similarity && <th>SS%</th>}
        {length && <th>Length</th>}
      </tr>
    )
  }

  function roundNumber(value) {
    if (typeof value !== 'undefined' && value !== null) {
      return Math.round(value * 100) / 100;
    }
  }

  function renderTableBody() {
    return (
      <tr key={1}>
        {rmsd && <td>{roundNumber(rmsd.value)}</td>}
        {tmscore && <td>{roundNumber(tmscore.value)}</td>}
        {simscore && <td>{roundNumber(simscore.value)}</td>}
        {identity && <td>{roundNumber(identity.value * 100)}</td>}
        {similarity && <td>{roundNumber(similarity.value * 100)}</td>}
        {length && <td>{length}</td>}
      </tr>
    )
  }

  return (
    <table className='tbl-stats'>
      <thead>{renderTableHeader()}</thead>
      <tbody>{renderTableBody()}</tbody>
    </table>
  )
}
