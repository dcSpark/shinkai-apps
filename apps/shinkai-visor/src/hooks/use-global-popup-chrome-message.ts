import { dataUrlToFile } from '@shinkai_network/shinkai-ui/helpers';
import { useNavigate } from 'react-router-dom';

import { ServiceWorkerInternalMessageType } from '../service-worker/communication/internal/types';
import { useAuth } from '../store/auth/auth';
import { useSettings } from '../store/settings/settings';
import { useChromeMessage } from './use-chrome-message';

export const useGlobalPopupChromeMessage = () => {
  const navigate = useNavigate();

  useChromeMessage(async (message, sender) => {
    switch (message.type) {
      case ServiceWorkerInternalMessageType.SendToAgent: {
        const params = new URLSearchParams({
          context: message?.data?.textContent,
        });
        navigate({
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
        navigate('/inboxes/create-job', {
          state: { files: [file] },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.SendPageToVectorFs: {
        const file = dataUrlToFile(
          message.data.fileDataUrl,
          message.data.filename,
        );
        navigate('/node-files', {
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
        navigate(`/inboxes/create-job?${params.toString()}`, {
          state: { files: [file] },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.SendCaptureToAgent: {
        const imageFile = dataUrlToFile(
          message.data.imageDataUrl,
          message.data.filename,
        );
        navigate('/inboxes/create-job', {
          state: { files: [imageFile] },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.SendVectorResourceToJobCreation: {
        const vrFile = dataUrlToFile(
          message.data.imageDataUrl,
          message.data.filename,
        );
        navigate('/inboxes/create-job', {
          state: { files: [vrFile] },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.SendVectorResourceToVectorFS: {
        const vrFile = dataUrlToFile(
          message.data.imageDataUrl,
          message.data.filename,
        );
        navigate('/node-files', {
          state: { files: [vrFile] },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.QuickConnectionIntent: {
        navigate('/nodes/connect/method/quick-start', {
          state: { nodeAddress: message.data.nodeAddress },
        });
        break;
      }
      case ServiceWorkerInternalMessageType.RehydrateStore:
        useAuth.persist.rehydrate();
        useSettings.persist.rehydrate();
        break;
      case ServiceWorkerInternalMessageType.ExportConnectionIntent: {
        navigate({
          pathname: '/settings/export-connection',
        });
        break;
      }
      default:
        break;
    }
  });
};
