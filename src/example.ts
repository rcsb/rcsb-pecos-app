import { createApp } from './index';

document.addEventListener('DOMContentLoaded', function (event) {
    createApp('app-container').then(()=>{
        console.log('Render done');
    });
});