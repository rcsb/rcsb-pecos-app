import { SEARCH_SERVICE_SUGGEST_URL } from './constants';

export async function suggestEntries(val) {
  if (!val) return [];
  const q = {
    type: 'term',
    suggest: {
      text: val,
      completion: [{ attribute: 'rcsb_entry_container_identifiers.entry_id' }],
      size: 10
    }
  };
  const url = SEARCH_SERVICE_SUGGEST_URL + encodeURIComponent(JSON.stringify(q));
  const responce = await fetch(url).then((r) => {
    if (r.status === 200) {
      return r.json()
    } else if (r.status === 204) {
      return null
    } else {
      throw new Error(`Failed to request suggestions for [ ${val} ]'`);
    }
  })
  if (responce === null) return [];
  return responce.suggestions['rcsb_entry_container_identifiers.entry_id']
          .map(item => item.text.replace(/<em>/g, '').replace(/<\/em>/g, ''));
}
