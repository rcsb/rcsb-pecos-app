import React from 'react';
import { render } from 'react-dom';
import Popup from 'react-popup';
import RcsbAlignmentApp from './alignment-app';
import './popup.css';
import './index.html';

Popup.registerPlugin('popover', function (content) {
    this.create({
        content: content,
        className: 'popover',
        noOverlay: true
    });
});

render(
    <>
        <Popup />
        <RcsbAlignmentApp />
    </>,
    document.getElementById('app-container')
);
