import { Button } from '@shinkai_network/shinkai-ui';
import React from 'react';

import { useAuth } from '../store/auth';
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
  const { data: isShinkaiNodeRunning } = useShinkaiNodeIsRunningQuery();
  const auth = useAuth((state) => state.auth);

  return !!auth && isShinkaiNodeRunning ? (
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
      <Button
        onClick={() => {
          openShinkaiNodeManagerWindow();
        }}
      >
        Launch Shinkai Node
      </Button>
    </div>
  );
};
