import './globals.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSyncOllamaModels } from '@shinkai_network/shinkai-node-state/lib/mutations/syncOllamaModels/useSyncOllamaModels';
import { useAuth } from '@shinkai_network/shinkai-node-state/store/auth';
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
  Separator,
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
import {
  Bot,
  ListRestart,
  Loader2,
  PlayCircle,
  StopCircle,
  Trash,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import logo from '../../../src-tauri/icons/128x128@2x.png';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';
import { initSyncStorage } from '../../store/sync-utils';
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
} from '../toasts-utils';
import { useShinkaiNodeEventsToast } from './shinkai-node-manager-hooks';
import {
  queryClient,
  useShinkaiNodeGetLastNLogsQuery,
  useShinkaiNodeGetOptionsQuery,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeKillMutation,
  useShinkaiNodeRemoveStorageMutation,
  useShinkaiNodeSetDefaultOptionsMutation,
  useShinkaiNodeSetOptionsMutation,
  useShinkaiNodeSpawnMutation,
} from './shinkai-node-process-client';
import { ShinkaiNodeOptions } from './shinkai-node-process-client-types';

initSyncStorage();

const App = () => {
  const auth = useAuth((auth) => auth.auth);
  const setLogout = useAuth((auth) => auth.setLogout);
  const { setShinkaiNodeOptions } = useShinkaiNodeManager();
  const logsScrollRef = useRef<HTMLDivElement | null>(null);
  const [isConfirmResetDialogOpened, setIsConfirmResetDialogOpened] =
    useState<boolean>(false);
  const { data: shinkaiNodeIsRunning } = useShinkaiNodeIsRunningQuery({
    refetchInterval: 1000,
  });
  const { data: shinkaiNodeOptions } = useShinkaiNodeGetOptionsQuery({
    refetchInterval: 1000,
  });
  const { data: lastNLogs } = useShinkaiNodeGetLastNLogsQuery(
    { length: 100 },
    {
      refetchInterval: 1000,
    },
  );
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
    onSuccess: () => {
      successRemovingShinkaiNodeStorageToast();
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
  } = useSyncOllamaModels({
    onSuccess: () => {
      successOllamaModelsSyncToast();
    },
    onError: () => {
      errorOllamaModelsSyncToast();
    },
  });

  useShinkaiNodeEventsToast();
  useEffect(() => {
    logsScrollRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [lastNLogs]);

  useEffect(() => {
    shinkaiNodeSetOptions(shinkaiNodeOptionsFormWatch as ShinkaiNodeOptions);
  }, [shinkaiNodeOptionsFormWatch, shinkaiNodeSetOptions]);

  const handleReset = (): void => {
    setIsConfirmResetDialogOpened(false);
    shinkaiNodeRemoveStorage();
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
  return (
    <div className="h-full w-full overflow-hidden p-8">
      <div className="flex flex-row items-center">
        <img alt="shinkai logo" className="h-10 w-10" src={logo} />
        <div className="ml-4 flex flex-col">
          <span className="text-lg">Local Shinkai Node</span>
          <span className="text-gray-80 text-sm">{`http://localhost:${shinkaiNodeOptions?.port}`}</span>
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
                    console.log('SPAWNING');
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

      <Tabs className="mt-4 h-[400px] w-full" defaultValue="logs">
        <TabsList className="w-full">
          <TabsTrigger className="grow" value="logs">
            Logs
          </TabsTrigger>
          <TabsTrigger className="grow" value="options">
            Options
          </TabsTrigger>
        </TabsList>
        <TabsContent className="h-full" value="logs">
          <ScrollArea className="h-full [&>div>div]:!block">
            <div className="p-1" ref={logsScrollRef}>
              {lastNLogs?.length
                ? lastNLogs?.map((log, index) => {
                    return (
                      <>
                        <div className="text-gray-80 text-sm" key={index}>
                          {'ℹ️'} {new Date(log.timestamp * 1000).toISOString()}{' '}
                          | {log.process} | {log.message}
                        </div>
                        <Separator className="my-2" />
                      </>
                    );
                  })
                : undefined}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent className="h-full" value="options">
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
          <ScrollArea className="mt-2 h-full [&>div>div]:!block">
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
          </ScrollArea>
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
                <div className="flex flex-col space-y-1 ">
                  <span className="text-sm">
                    Are you sure you want to reset your Shinkai Node? This will
                    permanently delete all your data.
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex gap-1">
            <AlertDialogCancel
              className="mt-0 flex-1"
              onClick={() => {
                setIsConfirmResetDialogOpened(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="flex-1" onClick={() => handleReset()}>
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <QueryClientProvider client={queryClient}>
    <React.StrictMode>
      <App />
      <Toaster />
    </React.StrictMode>
  </QueryClientProvider>,
);
