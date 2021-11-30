import React, { useEffect, useState, memo } from 'react';
import { deepEqual } from '../../utils/common';

function createMarkup(item) {
  return { __html: item }
}

function createRow(itemsList) {
  return itemsList.map((item, j) => {
    return <td key={j} dangerouslySetInnerHTML={createMarkup(item)} />
  });
}

function createBody(data) {
  return data.map((itemsList, i) => {
    return <tr key={i}>{createRow(itemsList)}</tr>
  });
}

//export default memo(View1DSequence, deepEqual);

export default function View1DSequence({ index, data }) {

  const [makrups, setMakrups] = useState([]);

  useEffect(() => {
    const run = async () => {
      const m = await data;
      setMakrups(m);
    }
    run();
  }, [index]);

  
  return (  
    <div className='panel-1d'>
      <table className='panel-1d-table'>
        <tbody>
          {createBody(makrups)}
        </tbody>
      </table>
    </div>
  )

  // return (
  //   <div className='panel-1d'>
  //     <table className='panel-1d-table'>
  //       <tbody>
  //         {makrups.map((itemsList, i) => (
  //           <tr key={i}>
  //             {itemsList.map((item, j) => (
  //               <td key={j} dangerouslySetInnerHTML={createMarkup(item)} />
  //             ))}
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </div>
  // )
};
