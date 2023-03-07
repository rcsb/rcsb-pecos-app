import '../skin/tabs.css';
import Tabs from 'rc-tabs';


export function Summary(props: { items: {
    name: string,
    component: JSX.Element
}[] }) {
    return <Tabs className='tabs-panel' defaultActiveKey='0' items={
        (props.items ?? []).map((item, index) => ({
            key: index.toString(),
            tabKey: item.name,
            label: item.component
        }))
    }/>;
}