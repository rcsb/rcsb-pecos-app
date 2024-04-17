export const asymIdsQuery = /* GraphQL */ `
query asymIds($id: String!) {
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
}
`;

export const polymerInstancesQuery = /* GraphQL */ `
query polymerInstances($ids: [String]!) {
  polymer_entity_instances(instance_ids: $ids) {
    rcsb_polymer_entity_instance_container_identifiers {
      asym_id
      auth_asym_id
    }
    polymer_entity {
      entry {
        rcsb_id
      }
      rcsb_polymer_entity {
        pdbx_description
      }
      entity_poly {
        pdbx_seq_one_letter_code_can
        rcsb_sample_sequence_length
      }
      rcsb_entity_source_organism {
        ncbi_scientific_name
        ncbi_parent_scientific_name
      }
    }
  }
}
`;

export const referenceSequenceCoverageQuery = /* GraphQL */ `
query referenceSequenceCoverage($ids: [String]!) {
  polymer_entity_instances(instance_ids: $ids) {
    rcsb_id
    polymer_entity {
      rcsb_polymer_entity_align {
        reference_database_accession
        aligned_regions {
          ref_beg_seq_id
          length
        }
      }
    }
  }
}  
`;

export const sequenceLengthQuery = /* GraphQL */ `
query sequenceLength($entryId: String!, $asymId: String!) {
  polymer_entity_instance(entry_id: $entryId, asym_id: $asymId) {
    polymer_entity {
      entity_poly {
        rcsb_sample_sequence_length
      }
    }
  }
}  
`;