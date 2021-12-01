import { Subject } from 'rxjs';

import {
    ALIGNMENT_SERVICE_SUBMIT_ENDPOINT, ALIGNMENT_SERVICE_RESULT_ENDPOINT,
    POLL_INTERVAL, POLL_TIMEOUT
} from '../utils/constants';

import QueryResponse from '../model/response/response';
import AlignmentJobStatusEnum from '../model/enum/enum-response-status';

const subject = new Subject();

const initialState = new QueryResponse();
let state = initialState;

/**
 * ResponseContext keeps track of the state of the alignment service response
 */
export const ResponseEventObservable = {
    init: () => subject.next(state),
    subscribe: (fn) => subject.subscribe(fn),
    submitRequest: async (request) => {
        ResponseEventObservable.clear();
        const data = request.toFormData();
        fetch(ALIGNMENT_SERVICE_SUBMIT_ENDPOINT, { method: 'POST', body: data })
            .then((r) => {
                if (r.status === 200) {
                    return r.text();
                } else {
                    throw new Error('Failed to submit the job to: ' + ALIGNMENT_SERVICE_SUBMIT_ENDPOINT);
                }
            })
            .then((in_uuid) => {
                const in_status = AlignmentJobStatusEnum.RUNNING.value;
                state = new QueryResponse({ info: { status: in_status, uuid: in_uuid } });
                subject.next(state);
                updateWindowUrl(in_uuid);
                return in_uuid;
            })
            .then((uuid) => {
                return pollUntilDone(uuid, POLL_INTERVAL, POLL_TIMEOUT);
            })
            .then((response) => {
                state = response;
                subject.next(state);
                resetWindowUrl();
            })
            .catch((e) => {
                ResponseEventObservable.setError(e.message);
            });
    },
    continue: (uuid) => {
        pollUntilDone(uuid, POLL_INTERVAL, POLL_TIMEOUT)
            .then((data) => {
                state = data;
                resetWindowUrl();
                subject.next(state);
            })
            .catch((e) => {
                ResponseEventObservable.setError(e.message);
            });
    },
    setResponse: (in_response) => {
        ResponseEventObservable.clear();
        try {
            state = new QueryResponse(in_response);
            subject.next(state);
        } catch (e) {
            ResponseEventObservable.setError(e.message);
        }
        resetWindowUrl();
    },
    setError: (in_message) => {
        const in_uuid = state.getInfo().getUuid();
        const in_status = AlignmentJobStatusEnum.ERROR.value;
        state = new QueryResponse({ info: { status: in_status, uuid: in_uuid, message: in_message } });
        subject.next(state);
        resetWindowUrl();
    },
    clear: () => {
        state = initialState;
        subject.next(state);
        resetWindowUrl();
    },
    initialState
};

function setNextWindowUrl(nextUrl) {
    const pageTitle = 'Structure Comparison';
    window.history.replaceState({}, pageTitle, nextUrl);
}

function updateWindowUrl(uuid) {
    const nextUrl = '?uuid=' + uuid;
    setNextWindowUrl(nextUrl);
    return uuid;
}

function resetWindowUrl() {
    const initUrl = window.location.href.split('?')[0];
    setNextWindowUrl(initUrl);
}

function delay(t) {
    return new Promise(function (resolve) {
        setTimeout(resolve, t);
    });
}

/**
 *
 * @param {*} uuid request token
 * @returns
 */
async function poll(uuid) {
    const url = ALIGNMENT_SERVICE_RESULT_ENDPOINT + '?uuid=' + uuid;
    return fetch(url, { method: 'get' })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else if (response.status === 404) {
                throw Error('The job results are unavailable. UUID can be wrong or the results were already claimed');
            } else {
                throw Error('Fatal error occurred: ' + response.statusText);
            }
        })
        .then(json => new QueryResponse(json))
        .catch(e => {
            console.error('EXCEPTION: ', e);
            throw new Error(e);
        });
}

async function pollUntilDone(uuid, interval, timeout) {
    const start = Date.now();
    async function run() {
    // check if had to wait for too long before continue to poll
        if (timeout !== 0 && Date.now() - start > timeout) { throw new Error('Did not receive complete results within the time that was prepared to wait'); }
        const job = await poll(uuid);
        if (job.isRunning()) {
            await delay(interval);
            return await run();
        } else if (job.isComplete() || job.isError()) {
            return job;
        } else {
            throw new Error('Unexpected API response: ' + job.toString());
        }
    }
    return run();
}

export default ResponseEventObservable;
