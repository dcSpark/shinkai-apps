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

import ssl
import pyodide_http
pyodide_http.patch_all()

import asyncio

async def async_custom_fetch(url):
    try:
        response_text = await custom_fetch(url)
        print('response_text ', response_text)
        return response_text.encode('utf-8')
    except Exception as e:
        print(f"async_custom_fetch error: {e}")
        raise

def sync_custom_fetch(url):
    loop = asyncio.get_event_loop()
    task = loop.create_task(async_custom_fetch(url))
    try:
        loop.run_until_complete(task)
        if task.done() and not task.cancelled():
            return task.result()
        else:
            print("sync_custom_fetch: Task did not complete successfully.")
            return b''
    except Exception as e:
        print(f"sync_custom_fetch exception: {e}")
        return b''

# Replace fetch.get with custom_fetch
import requests
from requests.models import Response

class CustomSession(requests.Session):
    def request(self, method, url, *args, **kwargs):
        # Use the custom_fetch function to get the response text
        response_content = sync_custom_fetch(url)

        # Create a new Response object
        response = Response()

        # Set the response content
        response._content = response_content

        # Set the status code (assuming success for this mock)
        response.status_code = 200

        return response

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
 * Fetches a web page by communicating with the main thread instead of directly invoking Tauri's `invoke`.
 *
 * @param url - The URL of the page to fetch.
 * @returns A promise that resolves to the page's body as a string.
 */
const fetchPage = (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Listen for the main thread's response
    const handleMessage = (event: MessageEvent) => {
      console.log('fetch-page-response (worked) ', event.data);
      if (event.data?.type === 'fetch-page-response' && event.data.meta === url) {
        console.log('fetch-page-response (worked) ', event.data);
        if (event.data.payload.status >= 200 && event.data.payload.status < 300) {
          resolve(event.data.payload.body);
        } else {
          reject(new Error(`HTTP Error: ${event.data.payload.status}`));
        }
        // Clean up the event listener after receiving the response
        self.removeEventListener('message', handleMessage);
      }
    };

    self.addEventListener('message', handleMessage);

    // Send a message to the main thread to perform the fetch
    self.postMessage({
      type: 'fetch-page',
      meta: url, // Identifier to match the response
    });
  });
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
