import { emit, listen, UnlistenFn } from '@tauri-apps/api/event';
import { debug, info } from '@tauri-apps/plugin-log';
import React from 'react';
import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';

import {
  PythonCodeRunnerWebWorkerMessage,
  RunResult,
} from './python-code-runner-web-worker';
import PythonRunnerWorker from './python-code-runner-web-worker?worker';

type RunPythonCodeRequest = {
  id: string;
  parameters: object;
  configurations: object;
  code: string;
};

type RunPythonCodeResponse = {
  result: RunResult;
};

type RunPythonCodeResponseError = {
  message: string;
};

const useRunPythonCodeEventListener = () => {
  useEffect(() => {
    let unlisten: UnlistenFn;

    const setupListener = async () => {
      unlisten = await listen<RunPythonCodeRequest>(
        'run-python-code-request',
        async (event) => {
          debug(`received run-python-code request: ${event.payload}`);
          const worker = new PythonRunnerWorker();
          worker.postMessage({
            type: 'run',
            payload: { code: event.payload.code },
          });
          let result: RunResult;
          try {
            result = await new Promise<RunResult>((resolve, reject) => {
              const timeout = setTimeout(() => {
                reject(new Error('execution timed out'));
              }, 30000);
              worker.onmessage = (event: {
                data: PythonCodeRunnerWebWorkerMessage;
              }) => {
                if (event.data.type === 'run-done') {
                  clearTimeout(timeout);
                  console.log('worker event', event);
                  resolve(event.data.payload);
                }
              };
              worker.onerror = (error: { message: string }) => {
                clearTimeout(timeout);
                info(`python code runner worker error ${String(error)}`);
                reject(new Error(`worker error: ${error.message}`));
              };
            }).finally(() => {
              worker.terminate();
            });
          } catch (e) {
            await emit(`run-python-code-response-error-${event.payload.id}`, {
              message: String(e),
            } as RunPythonCodeResponseError);
            return;
          }
          info(`emiting result for run-python-code-response-${event.payload.id} ${JSON.stringify(result)}`);
          await emit(`run-python-code-response-${event.payload.id}`, {
            result,
          } as RunPythonCodeResponse);
        },
      );
    };

    setupListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, []);
};

const App = () => {
  info('initializing window python-code-runner');
  useRunPythonCodeEventListener();
  return null;
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
