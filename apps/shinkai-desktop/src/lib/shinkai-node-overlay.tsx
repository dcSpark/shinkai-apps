import { ReloadIcon } from '@radix-ui/react-icons';
import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { Button } from '@shinkai_network/shinkai-ui';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { DownloadIcon, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { ResetConnectionDialog } from '../pages/layout/main-layout';
import { useAuth } from '../store/auth';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';
import { useRetrieveLogsQuery } from './shinkai-logs/logs-client';
import {
  useShinkaiNodeGetLastNLogsQuery,
  useShinkaiNodeIsRunningQuery,
} from './shinkai-node-manager/shinkai-node-manager-client';
import { openShinkaiNodeManagerWindow } from './shinkai-node-manager/shinkai-node-manager-windows-utils';

export const ShinkaiNodeRunningOverlay = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const auth = useAuth((store) => store.auth);
  const { data: isShinkaiNodeRunning, isPending: isShinkaiNodeRunningPending } =
    useShinkaiNodeIsRunningQuery();
  const isInUse = useShinkaiNodeManager((store) => store.isInUse);

  const {
    isSuccess: isHealthSuccess,
    data: health,
    isPending: isHealthPending,
    error: healthError,
    isError: isHealthError,
  } = useGetHealth(
    { nodeAddress: auth?.node_address ?? '' },
    { refetchInterval: 35000 },
  );

  const { data: tauriLogs } = useRetrieveLogsQuery({ enabled: !!healthError });
  const { data: lastNLogs } = useShinkaiNodeGetLastNLogsQuery(
    { length: 100 },
    { refetchInterval: 1000, enabled: !!healthError },
  );

  const [isResetConnectionDialogOpen, setIsResetConnectionDialogOpen] =
    useState(false);

  const isShinkaiNodeHealthy = isHealthSuccess && health.status === 'ok';

  if (isHealthPending || isShinkaiNodeRunningPending) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 py-8">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
        <span className="text-gray-80 text-sm">
          Checking Shinkai Node Status ...
        </span>
      </div>
    );
  }

  if (isHealthError) {
    return (
      <div className="flex size-full items-center justify-center">
        <div
          className="flex flex-col items-center gap-6 px-3 py-4 text-sm"
          role="alert"
        >
          <div className="space-y-2 text-center text-red-400">
            <p>Unable to connect to Shinkai Node.</p>
            <pre className="whitespace-break-spaces px-4">
              {healthError.message}
            </pre>
          </div>
          <div className="flex items-center gap-4">
            <Button
              className="min-w-[140px]"
              onClick={async () => {
                const file = new Blob(
                  [
                    '[[TAURI_LOGS]]: \n',
                    tauriLogs ?? '',
                    '\n',
                    '\n',
                    '\n',
                    '[[NODE_LOGS]]: \n',
                    (lastNLogs ?? [])
                      .map(
                        (log) =>
                          `${new Date(log.timestamp * 1000).toISOString()} | [${log.process}] ${log.message}\n`,
                      )
                      .join('\n') ?? '',
                  ],
                  {
                    type: 'text/plain',
                  },
                );

                const arrayBuffer = await file.arrayBuffer();
                const content = new Uint8Array(arrayBuffer);
                const fileName = `tauri-logs-${new Date().toISOString()}.txt`;

                const savePath = await save({
                  defaultPath: fileName,
                  filters: [
                    {
                      name: 'File',
                      extensions: ['txt'],
                    },
                  ],
                });

                if (!savePath) {
                  toast.info('Logs saving cancelled');
                  return;
                }

                await fs.writeFile(savePath, content, {
                  baseDir: BaseDirectory.Download,
                });

                toast.success(`Logs downloaded successfully`, {
                  description:
                    'You can find the logs file in your downloads folder',
                });
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <DownloadIcon className="size-3.5" />
              Download Logs
            </Button>
            <Button
              className="min-w-[140px]"
              onClick={() => setIsResetConnectionDialogOpen(true)}
              size="sm"
              type="button"
            >
              <ReloadIcon className="size-3.5" />
              Reset App
            </Button>
            <ResetConnectionDialog
              allowClose
              isOpen={isResetConnectionDialogOpen}
              onOpenChange={setIsResetConnectionDialogOpen}
            />
          </div>
        </div>
      </div>
    );
  }

  if (isShinkaiNodeHealthy && !!auth) {
    return children;
  }

  return (
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
