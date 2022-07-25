import './ui/skin/app.css';
import React from 'react';
import ReactDOM from 'react-dom';

import { ApplicationContext } from './context';
import { ApplicationContextContainer } from './ui/plugin';

import { QueryRequest } from './utils/request';

const DefaultAppConfigs = {
    service: {
        data: {
            base: 'https://data.rcsb.org',
            gql: 'graphql',
            httpHeaders: {}
        },
        search: {
            base: 'https://search.rcsb.org/rcsbsearch/v2',
            suggest: 'suggest',
            httpHeaders: {}
        },
        alignment: {
            base: 'https://alignment.rcsb.org/api/v1-beta',
            submit: 'structures/submit',
            results: 'structures/results',
            httpHeaders: {},
            // Delay (in milliseconds) between the last retry and next API call to get the results
            pollingIntervalMs: 1000,
            // Maximum time (in milliseconds) the application waits to get results from the server
            timeoutMs: 300 * 1000
        }
    }
};

export type AppConfigs = typeof DefaultAppConfigs;

export class Application {

    private readonly _context: ApplicationContext;

    constructor(elementOrId: string | HTMLElement, configs: Partial<AppConfigs> = {}) {

        const element = typeof elementOrId === 'string' ? this.getElementById(elementOrId) : elementOrId;
        if (!element) throw new Error(`Could not get element with id '${elementOrId}'`);

        const appConfig = { ...DefaultAppConfigs, ...configs };
        this._context = new ApplicationContext(appConfig);
        this._context.init();

        const component = React.createElement(ApplicationContextContainer, { ctx: this._context });
        ReactDOM.render(component, element);
    }

    private getElementById(elementId: string): HTMLElement {
        return document.getElementById(elementId) as HTMLElement;
    }

    align(request: QueryRequest): void {
        this._context.align(request);
    }
}

export async function createApp(elementOrId: string | HTMLElement, configs: Partial<AppConfigs> = {}): Promise<Application> {
    return new Application(elementOrId, configs);
}
