import { createApp } from './index';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
document.addEventListener('DOMContentLoaded', function (_event) {
    createApp('app-container').then(() => {
        console.log('Application is created');
    });
});