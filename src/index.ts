import './ui/skin/app.css';
import ReactDOM from 'react-dom';

import { ApplicationContext } from './context';
import { ApplicationContextContainer } from './ui/plugin';

import { QueryRequest } from './utils/request';
import React from 'react';

const DefaultAppConfigs = {
    service: {
        data: {
            base: 'https://data-models.rcsb.org',
            gql: 'graphql',
            httpHeaders: {}
        },
        search: {
            base: 'https://search-models.rcsb.org/rcsbsearch/v2',
            suggest: 'suggest',
            httpHeaders: {}
        },
        alignment: {
            base: 'http://localhost:8080/api/v1-beta',
            submit: 'structures/submit',
            results: 'structures/results',
            httpHeaders: {}
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
