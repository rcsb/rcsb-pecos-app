import { RcsbFvTooltipInterface } from '@rcsb/rcsb-saguaro/lib/RcsbFv/RcsbFvTooltip/RcsbFvTooltipInterface';
import {
    RcsbFvTrackDataAnnotationInterface
} from '@rcsb/rcsb-saguaro-app/lib/RcsbFvWeb/RcsbFvFactories/RcsbFvTrackFactory/RcsbFvTrackDataAnnotationInterface';

export class SequenceTooltip implements RcsbFvTooltipInterface {

    private readonly STRUCTURAL_ALIGNMENT = 'STRUCTURAL ALIGNMENT';
    private readonly SEQUENCE_ALIGNMENT = 'SEQUENCE ALIGNMENT';
    private readonly ALIGNMENT_UNAVAILABLE = 'ALIGNMENT UNAVAILABLE';
    private readonly ALIGNMENT_GAP = 'ALIGNMENT GAP';

    showTooltip(d: RcsbFvTrackDataAnnotationInterface): HTMLElement {
        const tooltipDiv = document.createElement<'div'>('div');

        let region: string = 'Position: ' + d.begin.toString();
        if (typeof d.end === 'number' && d.end !== d.begin) region += ' - ' + d.end.toString();
        const spanRegion: HTMLSpanElement = document.createElement<'span'>('span');
        spanRegion.append(region);

        if (typeof d.beginName === 'string' && d.indexName !== undefined) {
            spanRegion.append(SequenceTooltip.buildIndexNames(d.beginName, d.endName, d.indexName));
        }

        if (typeof d.oriBegin === 'number') {
            let ori_region: string = d.oriBegin.toString();
            if (typeof d.oriEnd === 'number') ori_region += ' - ' + d.oriEnd.toString();
            const spanOriRegion: HTMLSpanElement = document.createElement<'span'>('span');
            if (d.source !== undefined)
                spanOriRegion.append(' | [' + d.source.replace('_', ' ') + '] ' + d.sourceId + ': ' + ori_region);
            spanOriRegion.style.color = '#888888';
            if (typeof d.oriBeginName === 'string' && d.indexName !== undefined)
                spanOriRegion.append(SequenceTooltip.buildIndexNames(d.oriBeginName, d.oriEndName, d.indexName));
            spanRegion.append(spanOriRegion);
        }

        let title: string | undefined = this.ALIGNMENT_GAP;
        if (d.value === 100)
            title = this.STRUCTURAL_ALIGNMENT;
        else if (d.value === 75)
            title = this.SEQUENCE_ALIGNMENT;
        else if (d.value === 25)
            title = this.ALIGNMENT_UNAVAILABLE;
        tooltipDiv.append(title);

        if (typeof d.provenanceName === 'string') {
            const spanProvenance: HTMLSpanElement = document.createElement<'span'>('span');

            const spanProvenanceString: HTMLSpanElement = document.createElement<'span'>('span');
            spanProvenanceString.append(d.provenanceName);
            if (typeof d.provenanceColor === 'string')
                spanProvenanceString.style.color = d.provenanceColor;
            else
                spanProvenanceString.style.color = '#888888';
            spanProvenance.append(' [', spanProvenanceString, ']');
            spanProvenance.style.color = '#888888';
            tooltipDiv.append(spanProvenance);
            tooltipDiv.append(SequenceTooltip.bNode());
        } else if (title !== undefined) {
            tooltipDiv.append(SequenceTooltip.bNode());
        }
        tooltipDiv.append(spanRegion);
        return tooltipDiv;
    }

    private static buildIndexNames(beginName: string, endName: string|undefined, name: string): HTMLSpanElement {
        const spanAuthRegion: HTMLSpanElement = document.createElement<'span'>('span');
        let authRegion: string = beginName;
        if (typeof endName === 'string') authRegion += ' - ' + endName;
        spanAuthRegion.append(' [' + name + ': ' + authRegion + ']');
        spanAuthRegion.style.color = '#888888';
        return spanAuthRegion;
    }

    private static bNode(): HTMLSpanElement {
        const b: HTMLSpanElement = document.createElement<'span'>('span');
        b.append(' | ');
        b.style.fontWeight = 'bold';
        return b;
    }

}