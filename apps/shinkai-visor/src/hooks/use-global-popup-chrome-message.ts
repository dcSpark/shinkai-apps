import { useHistory } from 'react-router-dom';

import { dataUrlToFile } from '../helpers/blob-utils';
import { ServiceWorkerInternalMessageType } from '../service-worker/communication/internal/types';
import { useAuth } from '../store/auth/auth';
import { useSettings } from '../store/settings/settings';
import { useChromeMessage } from './use-chrome-message';

export const useGlobalPopupChromeMessage = () => {
  const history = useHistory();
  useChromeMessage(async (message, sender) => {
    switch (message.type) {
      case ServiceWorkerInternalMessageType.SendToAgent: {
        const params = new URLSearchParams({
          context: message?.data?.textContent,
        });
        history.push({
          pathname: '/inboxes/create-job',
          search: params.toString(),
        });
        break;
      }
      case ServiceWorkerInternalMessageType.SendPageToAgent: {
        const file = dataUrlToFile(
          message.data.fileDataUrl,
          message.data.filename,
        );
        history.push({
          pathname: '/inboxes/create-job',
          state: { files: [file] },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.SummarizePage: {
        const params = new URLSearchParams({
          initialText: 'Summarize this',
        });
        const file = dataUrlToFile(
          message.data.fileDataUrl,
          message.data.filename,
        );
        history.push({
          pathname: '/inboxes/create-job',
          state: { files: [file] },
          search: params.toString(),
        });
        break;
      }
      case ServiceWorkerInternalMessageType.SendCaptureToAgent: {
        const imageFile = dataUrlToFile(
          message.data.imageDataUrl,
          message.data.filename,
        );
        history.push({
          pathname: '/inboxes/create-job',
          state: { files: [imageFile] },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.QuickConnectionIntent: {
        history.push({
          pathname: '/nodes/connect/method/quick-start',
          state: { nodeAddress: message.data.nodeAddress },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.RehydrateStore:
        useAuth.persist.rehydrate();
        useSettings.persist.rehydrate();
        break;
      case ServiceWorkerInternalMessageType.ExportConnectionIntent: {
        history.push({
          pathname: '/settings/export-connection',
        });
        break;
      }
      default:
        break;
    }
  });
};
