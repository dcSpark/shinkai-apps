import { delay } from '@shinkai_network/shinkai-ui/helpers';
import { XIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

import shinkaiLogo from '../../assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { OPEN_SIDEPANEL_DELAY_MS } from '../../service-worker/action';
import { ServiceWorkerInternalMessageType } from '../../service-worker/communication/internal/types';

export enum VectorResourceType {
  DirectVrkai = 'direct-vrkai',
  DirectVrpack = 'direct-vrpack',
  Network = 'network',
  Http = 'http',
}
export type VectorResourceMetatag =
  | {
      'element-type':
        | VectorResourceType.DirectVrkai
        | VectorResourceType.DirectVrpack;
      content: string;
      metadata: string;
    }
  | {
      'element-type': VectorResourceType.Network;
      'network-path': string;
      metadata: string;
    }
  | {
      'element-type': VectorResourceType.Http;
      url: string;
      metadata: string;
    };

export const useVectorResourceMetatags = () => {
  const [isVectorResourceFound, setIsVectorResourceFound] =
    React.useState(false);
  const [currentVectorResource, setCurrentVectorResource] = React.useState('');

  useEffect(() => {
    const meta = document.querySelector(
      'meta[name="shinkai-vector-resources"]',
    );
    if (!meta) return;
    const vectorResources: VectorResourceMetatag[] = JSON.parse(
      meta.getAttribute('content') as string,
    );
    // for (const vectorResource of vectorResources) {
    //   if (vectorResource['element-type'] === VectorResourceType.Http) {
    const firstHttpVectorResource = vectorResources?.[0];
    if (!firstHttpVectorResource) return;
    if (firstHttpVectorResource['element-type'] === VectorResourceType.Http) {
      setIsVectorResourceFound(true);
      setCurrentVectorResource(firstHttpVectorResource.url);
      setTimeout(() => {
        toast.custom(
          (t) => (
            <VrNotification
              toastId={t}
              vectorResourceUrl={firstHttpVectorResource.url}
            />
          ),
          { duration: 4000 },
        );
      });
    }
    //   }
    // }
  }, []);
  return {
    isVectorResourceFound,
    currentVectorResource,
  };
};

type VrNotificationProps = {
  vectorResourceUrl: string;
  toastId: string | number;
};

export const sendVectorResourceFound = async (vectorResourceUrl: string) => {
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.OpenSidePanel,
  });
  await delay(OPEN_SIDEPANEL_DELAY_MS);
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.VectorResourceFound,
    data: { vectorResourceUrl },
  });
};
export const saveVectorResourceFound = async (vectorResourceUrl: string) => {
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.OpenSidePanel,
  });
  await delay(OPEN_SIDEPANEL_DELAY_MS);
  await chrome.runtime.sendMessage({
    type: ServiceWorkerInternalMessageType.UploadVectorResource,
    data: { vectorResourceUrl },
  });
};

const VrNotification = ({
  vectorResourceUrl,
  toastId,
}: VrNotificationProps) => {
  return (
    <button
      className="flex items-center gap-3"
      onClick={() => {
        sendVectorResourceFound(vectorResourceUrl);
        toast.dismiss(toastId);
      }}
    >
      <div className="flex items-center gap-1.5">
        <img
          alt="shinkai-app-logo select-none"
          className={'h-[25px] w-[25px] select-none'}
          src={srcUrlResolver(shinkaiLogo)}
        />
        <div className="flex flex-col">
          <span className="font-medium text-white">
            Shinkai Instant Q/A Available
          </span>
          <span className="text-gray-80 font-regular text-xs">
            Webpage is AI-Ready. Ask questions with no extra processing time by
            clicking here.
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <div
          className="h-[20px] w-[20px] rounded-full bg-neutral-700 p-1"
          onClick={(event) => {
            event.stopPropagation();
            toast.dismiss(toastId);
          }}
          role="button"
          tabIndex={0}
        >
          <XIcon className="h-full w-full" />
          <span className="sr-only">Dismiss</span>
        </div>
      </div>
    </button>
  );
};

export default VrNotification;
