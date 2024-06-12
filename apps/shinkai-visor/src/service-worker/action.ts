import { Buffer } from 'buffer';

import { sendMessage } from './communication/internal';
import {
  ServiceWorkerInternalMessage,
  ServiceWorkerInternalMessageType,
} from './communication/internal/types';

export const OPEN_SIDEPANEL_DELAY_MS = 600;

export const sendVectorResourceFoundToVectorFs = async (
  _info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
  vectorResourceUrl: string,
) => {
  if (!tab?.id) {
    return;
  }
  if (!vectorResourceUrl) {
    const [htmlContent] = await chrome.scripting.executeScript({
      target: { tabId: tab?.id },
      func: () => {
        return document.documentElement.outerHTML;
      },
      args: [],
    });
    const fileType = 'text/html';
    const message: ServiceWorkerInternalMessage = {
      type: ServiceWorkerInternalMessageType.SendPageToVectorFs,
      data: {
        filename: `${encodeURIComponent(tab.title || Date.now())}.html`,
        fileType: fileType,
        fileDataUrl: `data:${fileType};base64,${Buffer.from(
          htmlContent.result,
        ).toString('base64')}`,
      },
    };
    sendMessage(message);
    return;
  }
  const response = await fetch(vectorResourceUrl);
  const vectorResource = await response.text();
  const vectorResourceName = vectorResourceUrl.split('/').pop()?.split('.')[0];

  const fileType = '';
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendPageToVectorFs,
    data: {
      filename: `${encodeURIComponent(vectorResourceName || Date.now())}.vrkai`,
      fileType: fileType,
      fileDataUrl: `data:${fileType};base64,${Buffer.from(
        vectorResource,
      ).toString('base64')}`,
    },
  };
  sendMessage(message);
};
export const sendVectorResourceFoundToAgent = async (
  _info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
  vectorResourceUrl: string,
) => {
  if (!tab?.id) {
    return;
  }
  const response = await fetch(vectorResourceUrl);
  const vectorResource = await response.text();
  const vectorResourceName = vectorResourceUrl.split('/').pop()?.split('.')[0];

  const fileType = '';
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendPageToAgent,
    data: {
      filename: `${encodeURIComponent(vectorResourceName || Date.now())}.vrkai`,
      fileType: fileType,
      fileDataUrl: `data:${fileType};base64,${Buffer.from(
        vectorResource,
      ).toString('base64')}`,
    },
  };
  sendMessage(message);
};
export const sendPageToAgent = async (
  _info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
) => {
  // At this point, agents can just process text
  if (!tab?.id) {
    return;
  }
  const [htmlContent] = await chrome.scripting.executeScript({
    target: { tabId: tab?.id },
    func: () => {
      return document.documentElement.outerHTML;
    },
    args: [],
  });
  const fileType = 'text/html';
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendPageToAgent,
    data: {
      filename: `${encodeURIComponent(tab.url || Date.now())}.html`,
      fileType: fileType,
      fileDataUrl: `data:${fileType};base64,${Buffer.from(
        htmlContent.result,
      ).toString('base64')}`,
    },
  };
  sendMessage(message);
};
export const summarizePage = async (
  _info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
) => {
  // At this point, agents can just process text
  if (!tab?.id) {
    return;
  }
  const [htmlContent] = await chrome.scripting.executeScript({
    target: { tabId: tab?.id },
    func: () => {
      return document.documentElement.outerHTML;
    },
    args: [],
  });
  const fileType = 'text/html';
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SummarizePage,
    data: {
      filename: `${encodeURIComponent(tab.url || Date.now())}.html`,
      fileType: fileType,
      fileDataUrl: `data:${fileType};base64,${Buffer.from(
        htmlContent.result,
      ).toString('base64')}`,
    },
  };
  sendMessage(message);
};
export const sendCaptureToAgent = async (
  info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
) => {
  if (!tab?.id) {
    return;
  }
  const image = await new Promise<string>((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.captureVisibleTab(
        tab.windowId,
        { format: 'jpeg', quality: 92 },
        (image) => {
          resolve(image);
        },
      );
    });
  });
  let message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.CaptureImage,
    data: { image },
  };
  const croppedImage =
    await chrome.tabs.sendMessage<ServiceWorkerInternalMessage>(
      tab.id,
      message,
    );
  message = {
    type: ServiceWorkerInternalMessageType.SendCaptureToAgent,
    data: {
      imageDataUrl: croppedImage,
      filename: `${encodeURIComponent(tab.url || 'capture')}.jpeg`,
    },
  };
  sendMessage(message);
};

export const sendToAgent = async (
  info: chrome.contextMenus.OnClickData | undefined,
  tab: chrome.tabs.Tab | undefined,
) => {
  // At this point, agents can just process text
  if (!info?.selectionText || !tab?.id) {
    return;
  }
  const message: ServiceWorkerInternalMessage = {
    type: ServiceWorkerInternalMessageType.SendToAgent,
    data: {
      textContent: info.selectionText,
    },
  };
  sendMessage(message);
};
