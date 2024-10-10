/* eslint-disable no-restricted-globals */
import { loadPyodide, PyodideInterface } from 'pyodide';

export type CodeOutput = {
  rawOutput: string;
  figures: { type: 'plotly' | 'html'; data: string }[];
};

export type RunResult =
  | {
      state: 'success';
      stdout: string[];
      stderr: string[];
      result: {
        rawOutput: string;
        figures: { type: 'plotly' | 'html'; data: string }[];
      };
    }
  | {
      state: 'error';
      stdout: string[];
      stderr: string[];
      message: string;
    };

export type PythonCodeRunnerWebWorkerMessage = {
  type: 'run-done';
  payload: RunResult;
};

const INDEX_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/';

let pyodide: PyodideInterface;
const stdout: string[] = [];
const stderr: string[] = [];

const wrapCode = (code: string): string => {
  const wrappedCode = `
import sys
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
import json
import array

import pyodide_http
pyodide_http.patch_all()

import requests
from requests.models import Response

class CustomSession(requests.Session):
    def request(self, method, url, *args, **kwargs):
        try:
            print('Fetching URL:', url)
            response_content = custom_fetch(url)
            response = Response()
            response._content = response_content
            response.status_code = 200  # Assuming success
            return response
        except Exception as e:
            print(f"CustomSession request error: {e}")
            raise

# Override the default requests.get with our custom session's get method
requests.get = CustomSession().get

import matplotlib
matplotlib.use("AGG")

# Function to capture DataFrame display as HTML
def capture_df_display(df):
    return df.to_html()

output = None
outputError = None
figures = []

def execute_user_code():
${code
  .split('\n')
  .map((line) => `    ${line}`)
  .join('\n')}
    return locals()

try:
    user_code_result = execute_user_code()
    # Capture the last variable in the scope
    last_var = list(user_code_result.values())[-1] if user_code_result else None
    if isinstance(last_var, pd.DataFrame):
        output = capture_df_display(last_var)
    elif isinstance(last_var, (str, int, float, list, dict)):
        output = json.dumps(last_var)
    else:
        output = ''

    for var_name, var_value in user_code_result.items():
        if isinstance(var_value, go.Figure):
            figures.append({ 'type': 'plotly', 'data': pio.to_json(var_value) })
        if isinstance(var_value, pd.DataFrame):
            figures.append({ 'type': 'html', 'data': capture_df_display(var_value) })

except Exception as e:
    outputError = str(e)

figures = json.dumps(figures)
(output, outputError, figures)
    `;
  console.log('Running code:', wrappedCode);
  return wrappedCode;
};

const findImportsFromCodeString = async (code: string): Promise<string[]> => {
  const wrappedCode = `
from pyodide.code import find_imports
import json
code = """${code.replace(/"""/g, '\\"\\"\\"')}"""
imports = find_imports(code)
json.dumps(imports)
`;
  const jsonResult = await pyodide.runPythonAsync(wrappedCode);
  const result = JSON.parse(jsonResult);
  return result;
};

/**
 * Attempts to install dependencies for the given Python code using micropip.
 *
 * This method does its best effort to install all dependencies using micropip,
 * but it's important to note that not all packages may be available or compatible
 * with the Pyodide environment. Even after this method completes, some dependencies
 * might still not be found or properly installed due to various constraints of
 * the web-based Python runtime.
 *
 * This just do the best effort to install micropip dependencies
 * Native pyodide dependencies are install uner the hood when call runPythonAsync
 *
 * The function performs the following steps:
 * 1. Loads the 'micropip' package.
 * 2. Finds imports from both the wrapped code template and the user's code.
 * 3. Attempts to install each found dependency using micropip.
 *
 * @param code - The Python code string to analyze for dependencies.
 * @returns A Promise that resolves when the installation attempts are complete.
 */
const installDependencies = async (code: string): Promise<void> => {
  console.time('install micropip dependencies');
  await pyodide.loadPackage(['micropip']);
  const micropip = pyodide.pyimport('micropip');
  micropip.install('pyodide-http>=0.2.1');
  const codeDependencies = [
    // Our code wrapper constains dependencies so we need to install them
    ...(await findImportsFromCodeString(wrapCode(''))),
    ...(await findImportsFromCodeString(code)),
  ];
  console.log('trying to install the following dependencies', codeDependencies);
  const installPromises = codeDependencies.map((dependency) =>
    micropip.install(dependency),
  );
  await Promise.allSettled(installPromises);
  console.timeEnd('install micropip dependencies');
};

const run = async (code: string) => {
  console.time('run code');
  const wrappedCode = wrapCode(code);
  const [output, outputError, figures] =
    await pyodide.runPythonAsync(wrappedCode);
  if (outputError) {
    throw new Error(outputError);
  }
  console.timeEnd('run code');
  return { rawOutput: output, figures: JSON.parse(figures) };
};

/**
 * Synchronously fetches a web page by polling for messages.
 *
 * @param url - The URL of the page to fetch.
 * @returns The page's body as a string.
 * @throws Will throw an error if the HTTP request fails.
 */
const fetchPage = (url: string): string => {
  let result: string | null = null;
  let error: Error | null = null;

  const fetchAsync = async (): Promise<void> => {
    return new Promise((resolve) => {
      const handleMessage = (event: MessageEvent) => {
        console.log('> handleMessage', event);
        if (event.data?.type === 'fetch-page-sync-response' && event.data.meta === url) {
          if (event.data.payload.status >= 200 && event.data.payload.status < 300) {
            result = event.data.payload.body;
          } else {
            error = new Error(`HTTP Error: ${event.data.payload.status}`);
          }
          self.removeEventListener('message', handleMessage);
          resolve();
        }
      };

      self.addEventListener('message', handleMessage);

      self.postMessage({
        type: 'fetch-page-response',
        meta: url,
      });
    });
  };

  fetchAsync();

  // Polling loop to wait for the response
  while (result === null && error === null) {
    // Sleep for 50ms
    const start = Date.now();
    while (Date.now() - start < 50) {
      // Busy-wait
    }
  }

  // Check for errors
  if (error) {
    throw error;
  }

  return result!;
};

const initialize = async () => {
  console.time('initialize');
  pyodide = await loadPyodide({
    indexURL: INDEX_URL,
    stdout: (message) => {
      console.log('python stdout', message);
      stdout.push(message);
    },
    stderr: (message) => {
      console.log('python stderr', message);
      stderr.push(message);
    },
    fullStdLib: false,
  });
  console.log('Pyodide initialized');
  // **Inject fetchPage into Python's global scope**
  pyodide.globals.set('custom_fetch', fetchPage);

  console.timeEnd('initialize');
};

self.onmessage = async (event) => {
  switch (event.data?.type) {
    case 'run':
      console.time('total run time');
      try {
        await initialize();
        await installDependencies(event.data.payload.code);
        const runResult = await run(event.data.payload.code);
        self.postMessage({
          type: 'run-done',
          payload: {
            state: 'success',
            stdout,
            stderr,
            result: runResult,
          } as RunResult,
        });
      } catch (e) {
        self.postMessage({
          type: 'run-done',
          payload: {
            state: 'error',
            stdout,
            stderr,
            message: String(e),
          } as RunResult,
        });
      } finally {
        console.timeEnd('total run time');
      }
      break;
  }
};
