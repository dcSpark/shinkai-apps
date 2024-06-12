import { ServiceWorkerInternalMessageType } from '../service-worker/communication/internal/types';
import { useChromeMessage } from './use-chrome-message';

export const useGlobalImageCaptureChromeMessage = ({
  capture,
}: {
  capture: ({
    image,
    finishCapture,
  }: {
    image: string;
    finishCapture: (image: string) => void;
  }) => void;
}) => {
  useChromeMessage(async (message, sender, sendResponse) => {
    switch (message.type) {
      case ServiceWorkerInternalMessageType.CaptureImage: {
        capture({
          image: message.data.image,
          finishCapture: (image) => sendResponse(image),
        });
        break;
      }
      default:
        break;
    }
  });
};
