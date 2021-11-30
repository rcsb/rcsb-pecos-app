import '../tabs/index.css';

import React, {useState} from 'react';
import Tabs, { TabPane } from 'rc-tabs';

export default function TransformationOptions({ options, onChange }) {

  const [activeKey, setActiveKey] = useState(options[0].index.toString());

  const changeTab = (key) => {
    if (key === activeKey) return;
    const tabIndex = parseInt(key);
    setActiveKey(key);
    onChange(tabIndex);
  }

  return (
    <Tabs className='tabs-panel' 
          activeKey={activeKey} 
          onTabClick={changeTab}>
            {options.map((option) => (
              <TabPane tab={option.name} key={option.index.toString()} />
            ))}
    </Tabs>
  )
}
