import './globals.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { DownloadIcon } from '@radix-ui/react-icons';
import { useSyncOllamaModels } from '@shinkai_network/shinkai-node-state/lib/mutations/syncOllamaModels/useSyncOllamaModels';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  Form,
  FormField,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  TextField,
  Toaster,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import { info } from '@tauri-apps/plugin-log';
import { openPath } from '@tauri-apps/plugin-opener';
import {
  Bot,
  ListRestart,
  Loader2,
  PlayCircle,
  RotateCw,
  StopCircle,
  Trash,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import logo from '../../../src-tauri/icons/128x128@2x.png';
import { OllamaModels } from '../../components/shinkai-node-manager/ollama-models';
import {
  useDownloadTauriLogsMutation,
  useRetrieveLogsQuery,
} from '../../lib/shinkai-logs/logs-client';
import { ALLOWED_OLLAMA_MODELS } from '../../lib/shinkai-node-manager/ollama-models';
import {
  shinkaiNodeQueryClient,
  useShinkaiNodeGetOptionsQuery,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeKillMutation,
  useShinkaiNodeRemoveStorageMutation,
  useShinkaiNodeSetDefaultOptionsMutation,
  useShinkaiNodeSetOptionsMutation,
  useShinkaiNodeSpawnMutation,
} from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { ShinkaiNodeOptions } from '../../lib/shinkai-node-manager/shinkai-node-manager-client-types';
import { useShinkaiNodeEventsToast } from '../../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import {
  errorOllamaModelsSyncToast,
  errorRemovingShinkaiNodeStorageToast,
  shinkaiNodeStartedToast,
  shinkaiNodeStartErrorToast,
  shinkaiNodeStopErrorToast,
  shinkaiNodeStoppedToast,
  startingShinkaiNodeToast,
  stoppingShinkaiNodeToast,
  successOllamaModelsSyncToast,
  successRemovingShinkaiNodeStorageToast,
  successShinkaiNodeSetDefaultOptionsToast,
} from '../../lib/shinkai-node-manager/shinkai-node-manager-toasts-utils';
import { useAuth } from '../../store/auth';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';
import { useSyncStorageSecondary } from '../../store/sync-utils';

const App = () => {
  useEffect(() => {
    info('initializing shinkai-node-manager');
  }, []);
  useSyncStorageSecondary();
  const auth = useAuth((auth) => auth.auth);
  const setLogout = useAuth((auth) => auth.setLogout);
  const { setShinkaiNodeOptions } = useShinkaiNodeManager();
  const [isConfirmResetDialogOpened, setIsConfirmResetDialogOpened] =
    useState<boolean>(false);
  const { data: shinkaiNodeIsRunning } = useShinkaiNodeIsRunningQuery({
    refetchInterval: 1000,
  });
  const { data: shinkaiNodeOptions } = useShinkaiNodeGetOptionsQuery({
    refetchInterval: 1000,
  });

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

  const {
    isPending: shinkaiNodeSpawnIsPending,
    mutateAsync: shinkaiNodeSpawn,
  } = useShinkaiNodeSpawnMutation({
    onMutate: () => {
      startingShinkaiNodeToast();
    },
    onSuccess: () => {
      shinkaiNodeStartedToast();
    },
    onError: () => {
      shinkaiNodeStartErrorToast();
    },
  });
  const { isPending: shinkaiNodeKillIsPending, mutateAsync: shinkaiNodeKill } =
    useShinkaiNodeKillMutation({
      onMutate: () => {
        stoppingShinkaiNodeToast();
      },
      onSuccess: () => {
        shinkaiNodeStoppedToast();
      },
      onError: () => {
        shinkaiNodeStopErrorToast();
      },
    });
  const {
    isPending: shinkaiNodeRemoveStorageIsPending,
    mutateAsync: shinkaiNodeRemoveStorage,
  } = useShinkaiNodeRemoveStorageMutation({
    onSuccess: async () => {
      successRemovingShinkaiNodeStorageToast();
      setShinkaiNodeOptions(null);
      setLogout();
    },
    onError: () => {
      errorRemovingShinkaiNodeStorageToast();
    },
  });
  const { mutateAsync: shinkaiNodeSetOptions } =
    useShinkaiNodeSetOptionsMutation({
      onSuccess: (options) => {
        setShinkaiNodeOptions(options);
      },
    });
  const { mutateAsync: shinkaiNodeSetDefaultOptions } =
    useShinkaiNodeSetDefaultOptionsMutation({
      onSuccess: (options) => {
        shinkaiNodeOptionsForm.reset(options);
        successShinkaiNodeSetDefaultOptionsToast();
      },
    });
  const shinkaiNodeOptionsForm = useForm<ShinkaiNodeOptions>({
    resolver: zodResolver(z.any()),
  });
  const shinkaiNodeOptionsFormWatch = useWatch({
    control: shinkaiNodeOptionsForm.control,
  });
  const {
    mutateAsync: syncOllamaModels,
    isPending: syncOllamaModelsIsPending,
  } = useSyncOllamaModels(ALLOWED_OLLAMA_MODELS, {
    onSuccess: () => {
      successOllamaModelsSyncToast();
    },
    onError: () => {
      errorOllamaModelsSyncToast();
    },
  });

  useShinkaiNodeEventsToast();

  useEffect(() => {
    shinkaiNodeSetOptions(shinkaiNodeOptionsFormWatch as ShinkaiNodeOptions);
  }, [shinkaiNodeOptionsFormWatch, shinkaiNodeSetOptions]);

  const handleReset = (): void => {
    setIsConfirmResetDialogOpened(false);
    shinkaiNodeRemoveStorage({ preserveKeys: true });
  };

  const startSyncOllamaModels = (): void => {
    syncOllamaModels({
      nodeAddress: auth?.node_address ?? '',
      senderSubidentity: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      sender: auth?.node_address ?? '',
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

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
    <div className="flex h-screen w-full flex-col space-y-2 p-8">
      <div
        className="absolute top-0 z-50 h-6 w-full"
        data-tauri-drag-region={true}
      />
      <div className="flex flex-row items-center">
        <img alt="shinkai logo" className="h-10 w-10" src={logo} />
        <div className="ml-4 flex flex-col">
          <span className="text-lg">Local Shinkai Node</span>
          <span className="text-gray-80 text-sm">{`API URL: http://${shinkaiNodeOptions?.node_api_ip}:${shinkaiNodeOptions?.node_api_port}`}</span>
        </div>
        <div className="flex grow flex-row items-center justify-end space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  disabled={
                    shinkaiNodeSpawnIsPending ||
                    shinkaiNodeKillIsPending ||
                    shinkaiNodeIsRunning
                  }
                  onClick={() => {
                    console.log('spawning');
                    shinkaiNodeSpawn();
                  }}
                  variant={'default'}
                >
                  {shinkaiNodeSpawnIsPending || shinkaiNodeKillIsPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <PlayCircle className="" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Start Shinkai Node</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  disabled={
                    shinkaiNodeSpawnIsPending ||
                    shinkaiNodeKillIsPending ||
                    !shinkaiNodeIsRunning
                  }
                  onClick={() => shinkaiNodeKill()}
                  variant={'default'}
                >
                  {shinkaiNodeKillIsPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <StopCircle className="" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Stop Shinkai Node</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  disabled={shinkaiNodeIsRunning}
                  onClick={() => setIsConfirmResetDialogOpened(true)}
                  variant={'default'}
                >
                  {shinkaiNodeRemoveStorageIsPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Trash className="" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Reset Shinkai Node</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  disabled={!shinkaiNodeIsRunning}
                  onClick={() => startSyncOllamaModels()}
                  variant={'default'}
                >
                  {syncOllamaModelsIsPending ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Bot className="" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Sync Ollama Models</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <Tabs
        className="flex h-full w-full flex-col overflow-hidden"
        defaultValue="app-logs"
      >
        <TabsList className="w-full">
          <TabsTrigger className="grow" value="app-logs">
            App Logs
          </TabsTrigger>
          <TabsTrigger className="grow" value="options">
            Options
          </TabsTrigger>
          <TabsTrigger className="grow" value="models">
            Models
          </TabsTrigger>
        </TabsList>
        <TabsContent className="h-full overflow-hidden" value="app-logs">
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
        </TabsContent>
        <TabsContent className="h-full overflow-hidden" value="options">
          <ScrollArea className="flex h-full flex-1 flex-col overflow-auto [&>div>div]:!block">
            <div className="flex flex-row justify-end pr-4">
              <Button
                className=""
                disabled={shinkaiNodeIsRunning}
                onClick={() => shinkaiNodeSetDefaultOptions()}
                variant={'default'}
              >
                <ListRestart className="mr-2" />
                Restore default
              </Button>
            </div>
            <div className="mt-2 h-full [&>div>div]:!block">
              <Form {...shinkaiNodeOptionsForm}>
                <form className="space-y-2 pr-4">
                  {shinkaiNodeOptions &&
                    Array.from(Object.entries(shinkaiNodeOptions)).map(
                      ([key, value]) => {
                        return (
                          <FormField
                            control={shinkaiNodeOptionsForm.control}
                            defaultValue={value}
                            disabled={shinkaiNodeIsRunning}
                            key={key}
                            name={key as keyof ShinkaiNodeOptions}
                            render={({ field }) => (
                              <TextField
                                field={field}
                                label={<span className="uppercase">{key}</span>}
                              />
                            )}
                          />
                        );
                      },
                    )}
                </form>
              </Form>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent className="h-full overflow-hidden" value="models">
          <OllamaModels />
        </TabsContent>
      </Tabs>

      <AlertDialog
        onOpenChange={setIsConfirmResetDialogOpened}
        open={isConfirmResetDialogOpened}
      >
        <AlertDialogContent className="w-[75%]">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset your Shinkai Node</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="flex flex-col space-y-3 text-left text-white/70">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm">
                    Are you sure you want to reset your Shinkai Node? This will
                    permanently delete all your data.
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex justify-end gap-1">
            <AlertDialogCancel
              className="mt-0 min-w-[120px]"
              onClick={() => {
                setIsConfirmResetDialogOpened(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="min-w-[120px]"
              onClick={() => handleReset()}
            >
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <QueryClientProvider client={shinkaiNodeQueryClient}>
    <React.StrictMode>
      <App />
      <Toaster />
    </React.StrictMode>
  </QueryClientProvider>,
);
