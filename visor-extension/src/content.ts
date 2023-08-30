import React from 'react';
import ReactDOM from 'react-dom';
import { Messaging } from './messaging';

function shouldInject(): boolean {
  const documentElement = document.documentElement.nodeName;
  const docElemCheck = documentElement ? documentElement.toLowerCase() === 'html' : true;
  const { doctype } = window.document;
  const docTypeCheck = doctype ? doctype.name === 'html' : true;
  return docElemCheck && docTypeCheck;
}

function proofOfVisor() {
  (window as any).agrihanVisor = true;
}

function embed(fn: Function) {
  const script = document.createElement('script');
  script.text = `(${fn.toString()})();`;
  document.documentElement.appendChild(script);
}

function appendLauncher() {
  const shadowWrapper = document.createElement('div');
  const shadowDOM = shadowWrapper.attachShadow({ mode: 'open' });
  const modal = document.createElement('dialog');
  modal.id = 'command-launcher-container';
  modal.style.padding = '0';
  modal.style.borderWidth = '0px';
  modal.style.backgroundColor = 'transparent';
  modal.style.borderRadius = '24px';
  modal.style.borderColor = 'transparent';
  const frame = document.createElement('iframe');
  frame.src = 'chrome-extension://oadimaacghcacmfipakhadejgalcaepg/launcher.html';
  frame.allow = 'clipboard-read; clipboard-write';
  frame.id = 'frame';
  frame.style.height = '640px';
  frame.style.width = '760px';
  frame.style.borderWidth = '0px';
  modal.appendChild(frame);
  shadowDOM.appendChild(modal);
  document.documentElement.appendChild(shadowWrapper);
  const handleHotkeys = (e: any) => {
    if (e.data == 'close') {
      console.log('closing');
      const modal: any = <any>(
        document.querySelector('html > div').shadowRoot.querySelector('#command-launcher-container')
      );
      modal.close();
    }
    //its an sse data
    else {
      const modal: any = <any>(
        document.querySelector('html > div').shadowRoot.querySelector('#command-launcher-container')
      );
      modal.firstElementChild.contentWindow.postMessage(e.data, '*');
    }
  };
  window.addEventListener('message', handleHotkeys);
  window.addEventListener('click', e => {
    const modal: any = <any>(
      document.querySelector('html > div').shadowRoot.querySelector('#command-launcher-container')
    );
    if (modal.open) {
      console.log('closing modal on click');
      modal.close();
      modal.firstElementChild.contentWindow.postMessage('closing', '*');
    } else {
      console.log('modal not open');
    }
  });
}
const isMobileDevice = /Mobi/i.test(window.navigator.userAgent);

!isMobileDevice ? appendLauncher() : null;

if (shouldInject()) {
  embed(proofOfVisor);
  Messaging.createProxyController();
}
