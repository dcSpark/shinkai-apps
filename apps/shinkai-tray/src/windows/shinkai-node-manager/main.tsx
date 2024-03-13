import './globals.css';

import {
  Button,
  ScrollArea,
  Separator,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toaster,
} from '@shinkai_network/shinkai-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { Loader, PlayCircle, StopCircle } from 'lucide-react';
import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { toast } from "sonner";

import logo from '../../../src-tauri/icons/128x128@2x.png';
import {
  queryClient,
  useShinkaiNodeGetLastNLogsQuery,
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeKillMutation,
  useShinkaiNodeSpawnMutation,
} from './shinkai-node-process-client';

const App = () => {
  const logsScrollRef = useRef<HTMLDivElement | null>(null);
  const { data: shinkaiNodeIsRunning } = useShinkaiNodeIsRunningQuery({
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
    isError: shinkaiNodeSpawnError,
    mutateAsync: shinkaiNodeSpawn,
  } = useShinkaiNodeSpawnMutation({});

  const {
    isPending: shinkaiNodeKillIsPending,
    isError: shinkaiNodeKillError,
    mutateAsync: shinkaiNodeKill,
  } = useShinkaiNodeKillMutation({});

  useEffect(() => {
    if (shinkaiNodeSpawnError) {
      toast('Error starting your Shinkai Node, see logs for more information');
    }
  }, [shinkaiNodeSpawnError]);

  useEffect(() => {
    if (shinkaiNodeKillError) {
      toast('Error stopping your Shinkai Node, see logs for more information');
    }
  }, [shinkaiNodeKillError]);

  useEffect(() => {
    logsScrollRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end"
    });
  }, [lastNLogs]);

  return (
    <div className="h-full w-full p-8 overflow-hidden">
      <div className="flex flex-row items-center">
        <img alt="shinkai logo" className="h-10 w-10" src={logo} />
        <div className="ml-4 flex flex-col">
          <span className="text-lg">Local Shinkai Node</span>
          <span className="text-gray-80 text-sm">http://localhost:9550</span>
        </div>
        <div className="flex grow flex-row items-center justify-end space-x-4">
          <Button
            disabled={shinkaiNodeIsRunning}
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
            disabled={!shinkaiNodeIsRunning}
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
        </TabsList>
        <TabsContent className='h-full' value="logs">
          <ScrollArea className='h-full [&>div>div]:!block' >
            <div className="p-1" ref={logsScrollRef}>
              {lastNLogs?.length ?
                lastNLogs?.map((log, index) => {
                  return (
                    <>
                      <div className='text-sm text-gray-80' key={index}>{'>'} {log}</div>
                      <Separator className="my-2" />
                    </>
                  );
                }): undefined}
            </div>
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
