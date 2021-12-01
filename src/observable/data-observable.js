import { Subject } from 'rxjs';
import clonedeep from 'lodash.clonedeep';
import { fetchFromDataAPI } from '../utils/data';

const subject = new Subject();

const initialState = {
    instances: new Map()
};
let state = initialState;

export const DataEventObservable = {
    init: () => state = initialState,
    subscribe: (fn) => subject.subscribe(fn),
    getInstances: () => {
        return state.instances;
    },
    fetchInstanceDataFromAPI: async (instanceIds) => {
        fetchInstanceData(instanceIds)
            .then(data => {
                const _state = clonedeep(state);
                const map = new Map();
                instanceIds.map((id, i) => map.set(id, data[i]));
                _state.instances = map;
                subject.next(_state);
            });
    },
    getInstanceSequence: async (instanceId) => {
        if (state.instances && state.instances.has(instanceId)) {
            return state.instances.get(instanceId).pdbx_seq_one_letter_code;
        } else {
            const data = await fetchInstanceData([instanceId]).then(data => data[0]);
            state.instances.set(instanceId, data);
            return data.pdbx_seq_one_letter_code;
        }
    },
    getInstanceData: async (instanceId) => {
        if (state.instances && state.instances.has(instanceId)) {
            return state.instances.get(instanceId);
        } else {
            const data = await fetchInstanceData([instanceId]).then(data => data[0]);
            state.instances.set(instanceId, data);
            return data;
        }
    },
    clear: () => {
        state = initialState;
        subject.next(state);
    },
    initialState
};

async function fetchInstanceData(instanceIds) {
    const query = `
        query data ($instanceIds: [String]!) {
            polymer_entity_instances(instance_ids: $instanceIds) {
                rcsb_polymer_entity_instance_container_identifiers {
                    auth_asym_id
                }
                polymer_entity {
                    rcsb_polymer_entity {
                        pdbx_description
                    }
                    entity_poly {
                        pdbx_seq_one_letter_code_can
                        rcsb_sample_sequence_length
                    }
                }
            }
        }`;
    const response = await fetchFromDataAPI(query, { instanceIds: instanceIds });
    if (response && response.polymer_entity_instances) {
        const data = response.polymer_entity_instances.filter(i => i).map(instance => {
            return {
                auth_asym_id: instance.rcsb_polymer_entity_instance_container_identifiers.auth_asym_id,
                pdbx_description: instance.polymer_entity.rcsb_polymer_entity.pdbx_description,
                pdbx_seq_one_letter_code: instance.polymer_entity.entity_poly.pdbx_seq_one_letter_code_can,
                rcsb_sample_sequence_length: instance.polymer_entity.entity_poly.rcsb_sample_sequence_length
            };
        });
        return data;
    }
    return [];
}

export default DataEventObservable;
