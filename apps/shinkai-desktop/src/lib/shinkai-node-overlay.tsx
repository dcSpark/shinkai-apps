import { useGetHealth } from '@shinkai_network/shinkai-node-state/lib/queries/getHealth/useGetHealth';
import { Button } from '@shinkai_network/shinkai-ui';
import React, { useEffect, useState } from 'react';

import { useAuth } from '../store/auth';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';
import { useShinkaiNodeIsRunningQuery } from './shinkai-node-manager/shinkai-node-manager-client';
import { openShinkaiNodeManagerWindow } from './shinkai-node-manager/shinkai-node-manager-windows-utils';

export const AnalyticsEvents = {
  chatWithFiles: 'chat_with_files',
  UploadFiles: 'upload_files',
} as const;

export const ShinkaiNodeRunningOverlay = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuth((store) => store.auth);
  const [isShinkaiNodeHealthy, setIsShinkaiNodeHealthy] = useState<boolean>(false);
  const { data: isShinkaiNodeRunning } = useShinkaiNodeIsRunningQuery();
  const isInUse = useShinkaiNodeManager((store) => store.isInUse);
  const { data: health, isRefetchError: isHealthRefetchError } = useGetHealth(
    { node_address: auth?.node_address ?? '' },
    { refetchInterval: 15000 },
  );
  useEffect(() => {
    setIsShinkaiNodeHealthy(!isHealthRefetchError && health?.status === 'ok');
  }, [health, isHealthRefetchError]);

  return !!auth && isShinkaiNodeHealthy ? (
    children
  ) : (
    <div className="flex h-screen flex-col items-center justify-center gap-10">
      <div className="mx-auto flex max-w-lg flex-col items-center gap-4">
        <span className="text-4xl">⚠️</span>
        <h1 className="text-3xl font-bold">
          Unable to Connect to Shinkai Node
        </h1>
        <p className="text-gray-80 text-base">
          Please make sure the Shinkai Node is running and try again.
        </p>
      </div>
      {isInUse && !isShinkaiNodeRunning && (
        <Button
          onClick={() => {
            openShinkaiNodeManagerWindow();
          }}
        >
          Launch Shinkai Node
        </Button>
      )}
    </div>
  );
};
