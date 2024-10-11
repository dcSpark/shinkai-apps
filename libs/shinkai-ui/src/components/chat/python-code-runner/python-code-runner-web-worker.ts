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

let db: IDBDatabase | null = null;

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('fetchDB', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('responses', { keyPath: 'uuid' });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };
  });
};

const wrapCode = (code: string): string => {
  const wrappedCode = `
import sys
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
import json
import array
import time
import asyncio

import pyodide_http
pyodide_http.patch_all()

import requests
from requests.models import Response

class CustomSession(requests.Session):
    def request(self, method, url, *args, **kwargs):
        try:
            # Call the JavaScript function from Python
            uuid = "123"
            print('Fetching URL:', url)
            # Send fetch request
            sendFetchPageRequest(url, uuid)

            # Polling loop to check IndexedDB
            start_time = time.time()
            timeout = 10  # 10 seconds
            response_content = None

            def fetch_content():
                nonlocal response_content
                promise = readFromIndexedDB(uuid)
                promise.then(lambda content: setattr(response_content, content)).catch(lambda e: print("Error checking IndexedDB:", e))

                while time.time() - start_time < timeout:
                    if response_content:
                        break
                    # Sleep for 100ms
                    time.sleep(0.1)

            fetch_content()

            print("Response content:", response_content)

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
 * Sends a message to the main thread to fetch a page and store it in IndexedDB.
 *
 * @param url - The URL of the page to fetch.
 * @param uuid - The UUID to use for fetching the data from IndexedDB.
 */
const sendFetchPageRequest = (url: string, uuid: string): void => {
  self.postMessage({
    type: 'fetch-page-response',
    meta: url,
    uuid: uuid,
  });
};

/**
 * Checks IndexedDB for the fetched page data.
 *
 * @param uuid - The UUID to use for fetching the data from IndexedDB.
 * @returns The page's body as a string.
 * @throws Will throw an error if the data is not found or if there is an IndexedDB error.
 */
const checkIndexedDBForPage = (uuid: string): string => {
  let result: string | null = null;
  const error: Error | null = null;

  const fetchFromIndexedDB = (db: IDBDatabase): void => {
    const transaction = db.transaction('responses', 'readonly');
    const store = transaction.objectStore('responses');
    const getRequest = store.get(uuid);

    getRequest.onsuccess = () => {
      console.log('getRequest: ', getRequest);
      if (getRequest.result) {
        result = getRequest.result.body;
      }
    };

    getRequest.onerror = () => {
      // error = new Error('Error fetching data from IndexedDB');
    };
  };

  const startTime = Date.now();
  const timeout = 10000; // 10 seconds

  // print if db is loaded
  console.log('db', db);

  // Polling loop to wait for the response
  while (
    result === null &&
    error === null &&
    Date.now() - startTime < timeout
  ) {
    if (db) {
      fetchFromIndexedDB(db);
    }

    // Sleep for 50ms
    const start = Date.now();
    while (Date.now() - start < 50) {
      // Busy-wait
    }
  }

  // Check for timeout
  if (result === null) {
    throw new Error(
      'Timeout: Failed to fetch data from IndexedDB within 10 seconds',
    );
  }

  return result!;
};

// Function to read from IndexedDB
const readFromIndexedDB = (uuid: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject(new Error('IndexedDB is not initialized'));
    }

    const transaction = db.transaction('responses', 'readonly');
    const store = transaction.objectStore('responses');
    const getRequest = store.get(uuid);

    getRequest.onsuccess = () => {
      console.log('getRequest.onsuccess: ', getRequest);
      if (getRequest.result) {
        resolve(getRequest.result.body);
      } else {
        reject(new Error('No data found'));
      }
    };

    getRequest.onerror = () => {
      console.log('getRequest.onerror: ', getRequest);
      reject(new Error('Error fetching data from IndexedDB'));
    };
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
  // pyodide.globals.set('custom_fetch', fetchPage);
  pyodide.globals.set('sendFetchPageRequest', sendFetchPageRequest);
  pyodide.globals.set('readFromIndexedDB', readFromIndexedDB);

  // Open the IndexedDB and store it in the global variable
  db = await openDB();

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
