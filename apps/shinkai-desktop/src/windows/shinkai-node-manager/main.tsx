import './globals.css';

import { zodResolver } from '@hookform/resolvers/zod';
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
} from '@shinkai_network/shinkai-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import {
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
import { useAuth } from '../../store/auth';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';
import { initSyncStorage } from '../../store/sync-utils';
import {
  errorRemovingShinkaiNodeStorageToast,
  errorStartingShinkaiNodeToast,
  errorStoppingShinkaiNodeToast,
  startingShinkaiNodeToast,
  successRemovingShinkaiNodeStorageToast,
  successShinkaiNodeSetDefaultOptionsToast,
  successStartingShinkaiNodeToast,
  successStoppingShinkaiNodeToast,
} from '../toasts-utils';
import {
  queryClient,
  ShinkaiNodeOptions,
  useShinkaiNodeGetLastNLogsQuery,
  useShinkaiNodeGetOptionsQuery,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeKillMutation,
  useShinkaiNodeRemoveStorageMutation,
  useShinkaiNodeSetDefaultOptionsMutation,
  useShinkaiNodeSetOptionsMutation,
  useShinkaiNodeSpawnMutation,
} from './shinkai-node-process-client';

initSyncStorage();

const App = () => {
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
      successStartingShinkaiNodeToast();
    },
    onError: () => {
      errorStartingShinkaiNodeToast();
    },
  });
  const { isPending: shinkaiNodeKillIsPending, mutateAsync: shinkaiNodeKill } =
    useShinkaiNodeKillMutation({
      onSuccess: () => {
        successStoppingShinkaiNodeToast();
      },
      onError: () => {
        errorStoppingShinkaiNodeToast();
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

  return (
    <div className="h-full w-full overflow-hidden p-8">
      <div className="flex flex-row items-center">
        <img alt="shinkai logo" className="h-10 w-10" src={logo} />
        <div className="ml-4 flex flex-col">
          <span className="text-lg">Local Shinkai Node</span>
          <span className="text-gray-80 text-sm">{`http://localhost:${shinkaiNodeOptions?.port}`}</span>
        </div>
        <div className="flex grow flex-row items-center justify-end space-x-4">
          <Button
            disabled={
              shinkaiNodeSpawnIsPending ||
              shinkaiNodeKillIsPending ||
              shinkaiNodeIsRunning
            }
            onClick={() => shinkaiNodeSpawn()}
            variant={'default'}
          >
            {shinkaiNodeSpawnIsPending || shinkaiNodeKillIsPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PlayCircle className="" />
            )}
          </Button>

          <Button
            disabled={
              shinkaiNodeSpawnIsPending ||
              shinkaiNodeKillIsPending ||
              !shinkaiNodeIsRunning
            }
            onClick={() => shinkaiNodeKill()}
            variant={'default'}
          >
            {shinkaiNodeSpawnIsPending || shinkaiNodeKillIsPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <StopCircle className="" />
            )}
          </Button>

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
                          {'>'} {log}
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
