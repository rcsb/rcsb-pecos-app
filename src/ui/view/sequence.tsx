import { useEffect, useState } from 'react';
import { RcsbFv, RcsbFvInterface } from '@rcsb/rcsb-saguaro';
import { ApplicationContext } from '../../context';
import { Subscription } from 'rxjs';

function SequenceAlignmentComponent(props: { index: number, config: RcsbFvInterface }) {
    useEffect(() => {
        new RcsbFv(props.config);
    }, [props.index]);
    return <div style={{ height: '80px' }} key={props.index} id={props.config.elementId}></div>;
}

export function SequenceViewComponent(props: { ctx: ApplicationContext }) {

    const subs: Subscription[] = [];
    const [activeTarget, setTarget] = useState<number>();
    const [configs, setConfigs] = useState<RcsbFvInterface[]>([]);

    useEffect(() => {
        setConfigs(props.ctx.manager().sequenceParameters());
        subs.push(props.ctx.state.events.target.subscribe((e) => setTarget(e)));
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    return <>
        {(configs.length > 0 && activeTarget !== undefined)
            && <SequenceAlignmentComponent index={activeTarget} config={configs[activeTarget]}/>}
    </>;
}
