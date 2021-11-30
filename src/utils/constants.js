export const colorPalette = [0xc9771e, 0x4b7fcc, 0x229954];

export const POLL_INTERVAL = 1000;
export const POLL_TIMEOUT = 300 * 1000;

export const DATA_SERVICE_URL = 'https://data.rcsb.org';
export const SEARCH_SERVICE_URL = 'https://search.rcsb.org';
export const ALIGNMENT_SERVICE_URL = 'https://alignment.rcsb.org';

function route() {
  if (window?.RC?.instance === 'local' // running locally in sierra
      || window?.RC === undefined) // running locally in dev server
    // return 'http://localhost:8080';
    return 'https://alignment-dev.rcsb.org'
  else return ALIGNMENT_SERVICE_URL;
}

export const ALIGNMENT_SERVICE_SUBMIT_ENDPOINT = route() + '/api/v1-beta/structures/submit';
export const ALIGNMENT_SERVICE_RESULT_ENDPOINT = route() + '/api/v1-beta/structures/results';
export const SEARCH_SERVICE_SUGGEST_URL = SEARCH_SERVICE_URL + '/rcsbsearch/v1/suggest?json=';

export const REQUEST_BODY_PARAM = 'request-body';
export const RESPONSE_BODY_PARAM = 'response-body';
export const ENCODING_PARAM = 'encoded';