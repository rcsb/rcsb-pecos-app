import { Subscription } from 'rxjs';
import { useEffect, createRef } from 'react';
import {
    Viewer,
    ViewerProps
} from '@rcsb/rcsb-molstar/build/src/viewer';
import {
    LoadPdbIdParams,
    LoadFromUrlParams,
    LoadStructureParams
} from '../../manager/alignment-maganger';
import { ApplicationContext, DownloadOptions, SelectionOptions } from '../../context';

const molstarPluginConfigs: Partial<ViewerProps> = {
    showImportControls: false,
    showSessionControls: false,
    showStructureSourceControls: false,
    showSuperpositionControls: false,
    layoutShowLog: false,
    layoutShowControls: false
};

export function StructureViewComponent(props: { ctx: ApplicationContext }) {

    let viewer: Viewer;
    const viewerRef = createRef<HTMLDivElement>();

    const subs: Subscription[] = [];

    useEffect(() => {
        viewer = new Viewer(viewerRef.current as HTMLDivElement, molstarPluginConfigs);
        setTimeout(() => viewer.handleResize(), 500);
        subs.push(props.ctx.state.events.selection.subscribe((e) => load(e)));
        subs.push(props.ctx.state.events.download.subscribe((e) => download(e)));
        return () => subs.forEach(s => s.unsubscribe());
    }, []);

    function download(event: DownloadOptions) {
        if (event && (event === 'all' || event === 'structure')) {
            viewer.exportLoadedStructures();
            props.ctx.state.events.download.next(undefined);
        }
    }

    async function loadPresets(params: LoadStructureParams[]) {
        for (const p of params) {
            if (typeof p[2] === 'boolean') {
                await viewer.loadStructureFromUrl(...(p as LoadFromUrlParams));
            } else {
                await viewer.loadPdbId(...(p as LoadPdbIdParams));
            }
        }
    }

    function load(event: SelectionOptions) {
        if (!event) return;
        const params = props.ctx.manager().structureParameters(event);
        viewer.clear();
        loadPresets(params).then(() => viewer.resetCamera(0));
    }

    return <div className='viewer-canvas' ref={viewerRef} />;
}
