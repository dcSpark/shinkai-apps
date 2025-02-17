import { Button } from '@shinkai_network/shinkai-ui';
import { useVirtualizer } from '@tanstack/react-virtual';
import { openPath } from '@tauri-apps/plugin-opener';
import { DownloadIcon, Loader2, RotateCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  useDownloadTauriLogsMutation,
  useRetrieveLogsQuery,
} from '../../lib/shinkai-logs/logs-client';

export const Logs = () => {
  const {
    data: tauriLogs,
    refetch: refetchTauriLogs,
    isLoading: tauriLogsLoading,
  } = useRetrieveLogsQuery();

  const { mutate: downloadTauriLogs, isPending: downloadTauriLogsIsPending } =
    useDownloadTauriLogsMutation({
      onSuccess: (result) => {
        toast.success('Logs downloaded successfully', {
          description: `You can find the logs file in your downloads folder`,
          action: {
            label: 'Open',
            onClick: async () => {
              openPath(result.savePath);
            },
          },
        });
      },
      onError: (error) => {
        toast.error('Failed to download logs', {
          description: error.message,
        });
      },
    });

  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const tauriLogsLines = tauriLogs?.split('\n') ?? [];
    if (tauriLogsLines?.length && tauriLogsLines?.length !== logs?.length) {
      setLogs(tauriLogsLines);
    }
  }, [tauriLogs, logs]);

  const virtualizerParentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: logs?.length ?? 0,
    getScrollElement: () => virtualizerParentRef.current,
    estimateSize: () => 50, // Estimated height of each log line
    overscan: 20, // Number of items to render outside of the visible area
  });

  useEffect(() => {
    virtualizer.scrollToIndex(logs.length - 1, {
      behavior: 'auto',
    });
  }, [logs, virtualizer]);

  const refetchLogs = (): void => {
    refetchTauriLogs();
  };

  return (
    <div>
      <div className="h-full overflow-auto" ref={virtualizerParentRef}>
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              className="text-gray-80 absolute left-0 top-0 w-full font-mono text-xs leading-relaxed"
              key={virtualRow.index}
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {logs[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-6 right-12 flex gap-2">
        <Button
          disabled={tauriLogsLoading}
          onClick={() => refetchLogs()}
          rounded="lg"
          size="sm"
          type="button"
          variant="default"
        >
          {tauriLogsLoading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <RotateCw className="size-3.5" />
          )}
        </Button>
        <Button
          disabled={downloadTauriLogsIsPending}
          onClick={() => downloadTauriLogs()}
          rounded="lg"
          size="sm"
          type="button"
          variant="default"
        >
          {downloadTauriLogsIsPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <DownloadIcon className="ml-2 size-3.5" />
          )}
          Download Logs
        </Button>
      </div>
    </div>
  );
};
