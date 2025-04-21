import { useEffect } from 'react';
import { InstanceData } from '../../service/data-service';
import { getCombinedInstanceId } from '../../utils/identifier';
import { CloseSvg, Icon } from '../icons';

const InfoModal = (props: { isModalOpen: boolean, modalContent: InstanceData | undefined, onClose: () => void }) => {

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && props.isModalOpen) {
            props.onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', onKeyDown, false);
        return () => {
            document.removeEventListener('keydown', onKeyDown, false);
        };
    }, [props.isModalOpen]);

    if (props.isModalOpen !== true || props.modalContent === undefined) {
        return null;
    }

    const entry = () => {
        const id = (props.modalContent)
            ? getCombinedInstanceId(props.modalContent.entry_id, props.modalContent.asym_id)
            : 'N/A';
        return <><b>Entry ID:</b> {id}<br/></>;
    };

    const organism = () => {
        const name = (props.modalContent?.ncbi_scientific_name)
            ? `${props.modalContent.ncbi_scientific_name} (${props.modalContent.ncbi_parent_scientific_name})`
            : 'N/A';
        return <><b>Organism:</b> {name}<br/></>;
    };

    const molecule = () => {
        const name = (props.modalContent?.pdbx_description)
            ? props.modalContent.pdbx_description
            : 'N/A';
        return <><b>Name:</b> {name}<br/></>;
    };

    const quality = () => {
        if (props.modalContent?.resolution_combined) {
            const resolution = Math.min(...props.modalContent.resolution_combined).toFixed(2);
            return <><b>Resolution:</b> {resolution} <span>&#8491;</span><br/></>;
        } else if (props.modalContent?.ma_qa_metric_global) {
            return <><b>pLDDT (global):</b> {props.modalContent.ma_qa_metric_global}<br/></>;
        }
    };

    const methodology = () => {
        if (props.modalContent?.experimental_method) {
            return <><b>Experimental Method:</b> {props.modalContent.experimental_method}<br/></>;
        }
    };

    return (
        <section className="rcsb-alignment-modal"
            onClick={props.onClose}
        >
            <article className="rcsb-alignment-modal-content">
                <div style={ { cursor: 'pointer' } }>
                    <Icon
                        className='close-icon'
                        svg={CloseSvg}
                        onClick={props.onClose}
                    />
                </div>
                <main className="rcsb-alignment-modal-main"
                    onClick={e => {
                        // do not close modal if anything inside modal content is clicked
                        e.stopPropagation();
                    }}>
                    {entry()}
                    {molecule()}
                    {organism()}
                    {methodology()}
                    {quality()}
                </main>
            </article>
        </section>
    );
};

export default InfoModal;