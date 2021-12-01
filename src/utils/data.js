import { DATA_SERVICE_URL } from './constants';
import { memoizeOneArgAsync } from './common';

export async function fetchFromDataAPI(query, variables) {
    // Issuing GET request helps avoiding costly pre-flight CORS requests
    const url = DATA_SERVICE_URL +
    '/graphql?query=' + encodeURIComponent(query) +
    '&variables=' + encodeURIComponent(JSON.stringify(variables));
    return fetch(url)
        .then((response) => response.json())
        .then((json) => json.data);
}

export async function fetchAsymIds(entry) {
    const query = `
          query entry ($id: String!) {
              entry(entry_id:$id) {
                  polymer_entities {
                      entity_poly {
                        rcsb_entity_polymer_type
                        rcsb_sample_sequence_length
                      }
                      polymer_entity_instances {
                        rcsb_polymer_entity_instance_container_identifiers {
                          asym_id
                          auth_asym_id
                        }
                      }
                  }
              }
          }`;
    const data = await fetchFromDataAPI(query, { id: entry }).then((data) => {
        if (data.entry === null) return null;
        return data.entry.polymer_entities;
    });
    if (data !== null) {
        const proteins = data.filter(
            (entity) =>
                entity.entity_poly !== null &&
          entity.entity_poly.rcsb_entity_polymer_type === 'Protein' &&
          entity.entity_poly.rcsb_sample_sequence_length >= 10
        );
        if (proteins.length === 0) return [];
        return []
            .concat(...proteins.map((p) => p.polymer_entity_instances))
            .map((i) => [
                i.rcsb_polymer_entity_instance_container_identifiers.asym_id,
                i.rcsb_polymer_entity_instance_container_identifiers.auth_asym_id
            ]);
    }
    return [];
}

export const getAsymIdsMemoized = memoizeOneArgAsync(fetchAsymIds);
