import './globals.css';

import { zodResolver } from '@hookform/resolvers/zod';
import {
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
import { Loader, PlayCircle, StopCircle } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import logo from '../../../src-tauri/icons/128x128@2x.png';
import {
  queryClient,
  ShinkaiNodeOptions,
  useShinkaiNodeGetLastNLogsQuery,
  useShinkaiNodeGetOptionsQuery,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeKillMutation,
  useShinkaiNodeSpawnMutation,
} from './shinkai-node-process-client';

const App = () => {
  const SHINKAI_NODE_MANAGER_TOAST_ID = 'shinkai-node-manager-toast-id'
  const logsScrollRef = useRef<HTMLDivElement | null>(null);
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
      toast.loading('Starting you local Shinkai Node', { id: SHINKAI_NODE_MANAGER_TOAST_ID });
    },
    onSuccess: () => {
      toast.success('Your local Shinkai Node is running', { id: SHINKAI_NODE_MANAGER_TOAST_ID });
    },
    onError: () => {
      toast.error(
        'Error starting your local Shinkai Node, see logs for more information',
        { id: SHINKAI_NODE_MANAGER_TOAST_ID },
      );
    },
  });
  const { isPending: shinkaiNodeKillIsPending, mutateAsync: shinkaiNodeKill } =
    useShinkaiNodeKillMutation({
      onSuccess: () => {
        toast.success('Your local Shinkai Node was stopped', { id: SHINKAI_NODE_MANAGER_TOAST_ID });
      },
      onError: () => {
        toast.error(
          'Error stopping your local Shinkai Node, see logs for more information',
          { id: SHINKAI_NODE_MANAGER_TOAST_ID },
        );
      },
    });

  const shinkaiNodeOptionsForm = useForm<ShinkaiNodeOptions>({
    resolver: zodResolver(z.any()),
  });

  useEffect(() => {
    logsScrollRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [lastNLogs]);

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
              <Loader className="" />
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
              <Loader className="" />
            ) : (
              <StopCircle className="" />
            )}
          </Button>
        </div>
      </div>

      <Tabs className="mt-4 h-[400px] w-full" defaultValue="logs">
        <TabsList>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="options">Options</TabsTrigger>
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
          <ScrollArea className="h-full [&>div>div]:!block">

          <Form {...shinkaiNodeOptionsForm}>
            <form className="space-y-2 pr-4">
                {shinkaiNodeOptions &&
                  Array.from(Object.entries(shinkaiNodeOptions)).map(
                    ([key, value]) => {
                      return (
                        <FormField
                          control={shinkaiNodeOptionsForm.control}
                          defaultValue={value}
                          disabled={true}
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
