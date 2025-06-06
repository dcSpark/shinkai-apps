import './globals.css';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSyncOllamaModels } from '@shinkai_network/shinkai-node-state/v2/mutations/syncOllamaModels/useSyncOllamaModels';
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
import { info } from '@tauri-apps/plugin-log';
import {
  Bot,
  ListRestart,
  Loader2,
  PlayCircle,
  StopCircle,
  Trash,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import logo from '../../../src-tauri/icons/128x128@2x.png';
import { OllamaModels } from '../../components/shinkai-node-manager/ollama-models';
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
import { type ShinkaiNodeOptions } from '../../lib/shinkai-node-manager/shinkai-node-manager-client-types';
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
import { Logs } from './components/logs';

const App = () => {
  useEffect(() => {
    void info('initializing shinkai-node-manager');
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
  const shinkaiNodeOptionsForm = useForm<Partial<ShinkaiNodeOptions>>({
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
    const options = {
      ...shinkaiNodeOptions,
      ...shinkaiNodeOptionsFormWatch,
    };
    void shinkaiNodeSetOptions(options as ShinkaiNodeOptions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shinkaiNodeOptionsFormWatch, shinkaiNodeSetOptions]);

  const handleReset = (): void => {
    setIsConfirmResetDialogOpened(false);
    void shinkaiNodeRemoveStorage({ preserveKeys: true });
  };

  const startSyncOllamaModels = async () => {
    await syncOllamaModels({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      allowedModels: ALLOWED_OLLAMA_MODELS,
    });
  };

  const [shinkaiNodeOptionsForUI, setShinkaiNodeOptionsForUI] =
    useState<Partial<ShinkaiNodeOptions>>();

  useEffect(() => {
    const filteredShinkaiNodeOptionsKeys: (keyof ShinkaiNodeOptions)[] = [
      'secret_desktop_installation_proof_key',
    ];
    setShinkaiNodeOptionsForUI(
      Object.fromEntries(
        Object.entries(shinkaiNodeOptions ?? {}).filter(
          ([key]) =>
            !filteredShinkaiNodeOptionsKeys.includes(
              key as keyof ShinkaiNodeOptions,
            ),
        ),
      ) as Partial<ShinkaiNodeOptions>,
    );
  }, [shinkaiNodeOptions]);

  return (
    <div className="flex h-screen w-full flex-col space-y-2">
      <div
        className="absolute top-0 z-50 h-6 w-full"
        data-tauri-drag-region={true}
      />
      <div className="flex flex-row items-center p-4">
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
                    void shinkaiNodeSpawn();
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
        className="mt-4 flex h-full w-full flex-col overflow-hidden p-4"
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
          <Logs />
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
                  {shinkaiNodeOptionsForUI &&
                    Object.entries(shinkaiNodeOptionsForUI).map(
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

        <TabsContent className="h-full overflow-hidden pb-2" value="models">
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
