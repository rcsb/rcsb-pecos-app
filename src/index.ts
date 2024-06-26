import './assets';

import React from 'react';
import { createRoot } from 'react-dom/client';

import { ApplicationContext } from './context';
import { ApplicationContextContainer } from './ui/plugin';

import { QueryRequest } from './utils/request';
import { deepMerge } from './utils/helper';
import { RecursivePartial } from './utils/types';

const DefaultAppConfigs = {
    service: {
        data: {
            base: 'https://data.rcsb.org',
            gql: 'graphql',
            httpHeaders: {}
        },
        search: {
            base: 'https://search.rcsb.org/rcsbsearch/v2',
            search: 'query',
            suggest: 'suggest',
            suggestDebounceMs: 500,
            httpHeaders: {}
        },
        alignment: {
            base: 'https://alignment.rcsb.org/api/v1',
            submit: 'structures/submit',
            results: 'structures/results',
            httpHeaders: {},
            // Delay (in milliseconds) between the last retry and next API call to get the results
            pollingIntervalMs: 1000,
            // Maximum time (in milliseconds) the application waits to get results from the server
            timeoutMs: 300 * 1000,
            // Maximum number of structures allowed as input for pairwise alignment
            maxNumStructuresPairwise: 10
        },
        fileUpload: {
            base: 'https://user-upload.rcsb.org/v1/',
            upload: 'putMultipart',
            download: 'download',
            httpHeaders: {}
        }
    },
    environment: {
        base: 'https://www.rcsb.org'
    }
};

export type AppConfigs = typeof DefaultAppConfigs;

export class Application {

    private readonly _context: ApplicationContext;

    constructor(elementOrId: string | HTMLElement, configs: RecursivePartial<AppConfigs> = {}) {

        const element = typeof elementOrId === 'string' ? this.getElementById(elementOrId) : elementOrId;
        if (!element) throw new Error(`Could not get element with id '${elementOrId}'`);

        const appConfig = deepMerge(DefaultAppConfigs, configs) as AppConfigs;
        this._context = new ApplicationContext(appConfig);
        this._context.init();

        const component = React.createElement(ApplicationContextContainer, { ctx: this._context });
        const root = createRoot(element);
        root.render(component);
    }

    private getElementById(elementId: string): HTMLElement {
        return document.getElementById(elementId) as HTMLElement;
    }

    align(request: QueryRequest): void {
        this._context.align(request);
    }

    request(): QueryRequest | null {
        return this._context.request();
    }
}

export async function createApp(elementOrId: string | HTMLElement, configs: RecursivePartial<AppConfigs> = {}): Promise<Application> {
    return new Application(elementOrId, configs);
}
