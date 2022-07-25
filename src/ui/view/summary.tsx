import '../skin/tabs.css';
import Tabs, { TabPane } from 'rc-tabs';

export function Summary(props: { items: {
    name: string,
    component: JSX.Element
}[] }) {
    return <Tabs className='tabs-panel' defaultActiveKey='0'>
        {props.items.length > 0 && props.items.map((item, index) => {
            return <TabPane tab={item.name} key={index.toString()} id={index.toString()}>
                {item.component}
            </TabPane>;
        })}
    </Tabs>;
}