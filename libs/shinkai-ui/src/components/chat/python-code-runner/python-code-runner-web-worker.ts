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

// Flag to check if Pyodide has been initialized
let isInitialized = false;

// Wrap user code with additional Python setup
const wrapCode = (code: string): string => {
  const wrappedCode = `
import sys
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
import json
import array
import os

import requests
from requests.models import Response

class CustomSession(requests.Session):
    def request(self, method, url, *args, **kwargs):
        try:
            print('Fetching URL:', url)
            headers = kwargs.get('headers', {})
            body = kwargs.get('data', None) or kwargs.get('json', None)
            print('headers', headers);
            print('method', method);
            if body:
                print('body', body);
            response_content = custom_fetch(url, headers, method, body)
            response = Response()
            response._content = response_content.encode(encoding="utf-8")
            response.status_code = 200  # Assuming success
            return response
        except Exception as e:
            print(f"CustomSession request error: {e}")
            raise

requests.get = CustomSession().get
requests.post = CustomSession().post

import matplotlib
matplotlib.use("AGG")

# Ensure the working directory exists
os.makedirs('/working', exist_ok=True)

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
    import traceback
    outputError = "%s - %s" % (str(e), traceback.format_exc())

figures = json.dumps(figures)
(output, outputError, figures)
  `;
  console.log('Running code:', wrappedCode);
  return wrappedCode;
};

// Function to find imports from Python code
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
 * Native pyodide dependencies are install under the hood when call runPythonAsync
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
  // TODO: i think is safe to remove this since we are not using pyodide-http
  // await micropip.install('pyodide-http>=0.2.1');

  const codeDependencies = [
    // Our code wrapper contains dependencies so we need to install them
    ...(await findImportsFromCodeString(wrapCode(''))),
    ...(await findImportsFromCodeString(code)),
  ];
  console.log(
    'Trying to install the following dependencies:',
    codeDependencies,
  );

  const installPromises = codeDependencies.map((dependency) =>
    micropip.install(dependency),
  );
  await Promise.allSettled(installPromises);
  console.timeEnd('install micropip dependencies');
};

// Function to execute Python code
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
 * @param headers - The headers to include in the request.
 * @param method - The HTTP method ('GET' or 'POST').
 * @param body - The body of the request (optional).
 * @returns The page's body as a string.
 * @throws Will throw an error if the HTTP request fails.
 */
const fetchPage = (
  url: string,
  headers: any,
  method: 'GET' | 'POST',
  body: any = null,
): string => {
  console.log('fetchPage called with url:', url);
  console.log('fetchPage called with headers:', headers);
  console.log('fetchPage called with method:', method);
  if (body) {
    console.log('fetchPage called with body:', body);
  }

  const filteredHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers.toJs())) {
    if (typeof key === 'string' && typeof value === 'string') {
      filteredHeaders[key] = value;
    }
  }
  console.log('filteredHeaders', filteredHeaders);

  // Process body based on its type
  let processedBody: any = null;
  if (body) {
    if (typeof body === 'string') {
      processedBody = body; // If it's a string, use it directly
    } else if (body && typeof body.toJs === 'function') {
      // Check if body has a toJs method, indicating it might be a Proxy
      try {
        const jsBody = body.toJs();
        processedBody = {};
        const proxyEntries = Object.entries(jsBody);
        for (const [key, value] of proxyEntries) {
          processedBody[key] = value;
        }
      } catch (error) {
        console.error('Error processing Proxy-like body:', error);
      }
    } else if (typeof body === 'object') {
      processedBody = JSON.stringify(body); // Convert JSON object to string
    }
  }
  console.log('Final processedBody:', processedBody);

  const bufferSize = 512 * 1024; // Fixed buffer size of 512kb
  const sharedBuffer = new SharedArrayBuffer(bufferSize);
  const syncArray = new Int32Array(sharedBuffer, 0, 1);
  const dataArray = new Uint8Array(sharedBuffer, 4);

  try {
    self.postMessage({
      type: 'page', // Updated message type
      method, // Include method in the message
      meta: url,
      headers: filteredHeaders,
      body: processedBody, // Use processed body
      sharedBuffer,
    });

    console.log('Posted message to main thread, waiting for response...');

    const textDecoder = new TextDecoder();
    let result = '';
    let moreChunks = true;

    while (moreChunks) {
      // Busy-wait loop
      while (syncArray[0] === 0) {
        // This loop will block the thread until syncArray[0] changes
      }

      console.log('Polling done with status: ', syncArray[0]);

      if (syncArray[0] === -1) {
        const errorMessage = textDecoder.decode(dataArray);
        console.error('Error fetching page:', errorMessage);
        throw new Error(errorMessage);
      }

      // Read the current chunk
      const chunk = textDecoder.decode(dataArray).replace(/\0/g, '').trim();
      result += chunk;

      console.log(`Received chunk of length: ${chunk.length}`);

      // Check if more chunks are needed
      if (syncArray[0] === 1) {
        moreChunks = false; // Success, all chunks received
      } else {
        // Signal readiness for the next chunk
        syncArray[0] = 0;
        Atomics.notify(syncArray, 0);
      }
    }

    console.log(`Total received data of length: ${result.length}`);
    console.log('result: ', result);

    return result;
  } catch (e) {
    console.error('An error occurred:', e);
    throw new Error(
      'Failed to fetch page: ' +
        (e instanceof Error ? e.message : 'Unknown error'),
    );
  }
};

// Initialize Pyodide and set up the filesystem
const initialize = async () => {
  if (isInitialized) {
    console.log('Pyodide is already initialized.');
    return;
  }

  console.time('initialize');
  pyodide = await loadPyodide({
    indexURL: INDEX_URL,
    stdout: (message) => {
      console.log('python stdout:', message);
      stdout.push(message);
    },
    stderr: (message) => {
      console.log('python stderr:', message);
      stderr.push(message);
    },
    fullStdLib: false,
  });
  console.log('Pyodide initialized');

  initializeCustomFS(pyodide);

  // Inject fetchPage into Python's global scope
  pyodide.globals.set('custom_fetch', fetchPage);

  isInitialized = true;
  console.timeEnd('initialize');
};

function initializeCustomFS(pyodide: PyodideInterface) {
  const FS = pyodide.FS;
  const PATH = pyodide.PATH;
  const MEMFS = FS.filesystems.MEMFS;

  const customFSAsync = {
    DIR_MODE: 16384 | 511, // DIR_MODE: {{{ cDefine('S_IFDIR') }}} | 511 /* 0777 */,
    FILE_MODE: 32768 | 511, // FILE_MODE: {{{ cDefine('S_IFREG') }}} | 511 /* 0777 */,
    mount: function (mount: any) {
      console.log('Mounting CustomFS');
      return MEMFS.mount.apply(null, arguments);
    },
    syncfs: async (mount: any, populate: boolean, callback: Function) => {
      console.log('Syncing CustomFS');
      try {
        const local = customFSAsync.getLocalSet(mount);
        const remote = await customFSAsync.getRemoteSet(mount);
        const src = populate ? remote : local;
        const dst = populate ? local : remote;
        await customFSAsync.reconcile(mount, src, dst);
        callback(null);
      } catch (e) {
        callback(e);
      }
    },
    getLocalSet: (mount: any) => {
      console.log('Getting local set');
      const entries = Object.create(null);

      function isRealDir(p: string) {
        return p !== "." && p !== "..";
      }

      function toAbsolute(root: string) {
        return (p: string) => PATH.join2(root, p);
      }

      const check = FS.readdir(mount.mountpoint)
        .filter(isRealDir)
        .map(toAbsolute(mount.mountpoint));

      while (check.length) {
        const path = check.pop();
        const stat = FS.stat(path);

        if (FS.isDir(stat.mode)) {
          check.push.apply(
            check,
            FS.readdir(path).filter(isRealDir).map(toAbsolute(path))
          );
        }

        entries[path] = { timestamp: stat.mtime, mode: stat.mode };
      }

      return { type: "local", entries: entries };
    },
    getRemoteSet: async (mount: any) => {
      console.log('Getting remote set');
      // In this implementation, we'll use localStorage to simulate remote storage
      const entries = Object.create(null);
      const storagePrefix = 'customFS_';

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(storagePrefix)) {
          const path = key.slice(storagePrefix.length);
          const item = JSON.parse(localStorage.getItem(key));
          entries[PATH.join2(mount.mountpoint, path)] = {
            timestamp: new Date(item.timestamp),
            mode: item.mode,
          };
        }
      }

      return { type: "remote", entries };
    },
    loadLocalEntry: (path: string) => {
      console.log('Loading local entry:', path);
      const lookup = FS.lookupPath(path);
      const node = lookup.node;
      const stat = FS.stat(path);

      if (FS.isDir(stat.mode)) {
        return { timestamp: stat.mtime, mode: stat.mode };
      } else if (FS.isFile(stat.mode)) {
        node.contents = MEMFS.getFileDataAsTypedArray(node);
        return {
          timestamp: stat.mtime,
          mode: stat.mode,
          contents: node.contents,
        };
      } else {
        throw new Error("node type not supported");
      }
    },
    storeLocalEntry: (path: string, entry: any) => {
      console.log('Storing local entry:', path);
      if (FS.isDir(entry.mode)) {
        FS.mkdirTree(path, entry.mode);
      } else if (FS.isFile(entry.mode)) {
        FS.writeFile(path, entry.contents, { canOwn: true });
      } else {
        throw new Error("node type not supported");
      }

      FS.chmod(path, entry.mode);
      FS.utime(path, entry.timestamp, entry.timestamp);
    },
    removeLocalEntry: (path: string) => {
      console.log('Removing local entry:', path);
      const stat = FS.stat(path);

      if (FS.isDir(stat.mode)) {
        FS.rmdir(path);
      } else if (FS.isFile(stat.mode)) {
        FS.unlink(path);
      }
    },
    loadRemoteEntry: async (path: string) => {
      console.log('Loading remote entry:', path);
      const item = localStorage.getItem('customFS_' + path);
      if (item) {
        const entry = JSON.parse(item);
        return {
          contents: new Uint8Array(entry.contents),
          mode: entry.mode,
          timestamp: new Date(entry.timestamp),
        };
      }
      throw new Error("Remote entry not found");
    },
    storeRemoteEntry: async (path: string, entry: any) => {
      console.log('Storing remote entry:', path);
      localStorage.setItem('customFS_' + path, JSON.stringify({
        contents: Array.from(entry.contents || []),
        mode: entry.mode,
        timestamp: entry.timestamp.getTime(),
      }));
    },
    removeRemoteEntry: async (path: string) => {
      console.log('Removing remote entry:', path);
      localStorage.removeItem('customFS_' + path);
    },
    reconcile: async (mount: any, src: any, dst: any) => {
      console.log('Reconciling');
      let total = 0;

      const create: Array<string> = [];
      Object.keys(src.entries).forEach(function (key) {
        const e = src.entries[key];
        const e2 = dst.entries[key];
        if (!e2 || (FS.isFile(e.mode) && e.timestamp.getTime() > e2.timestamp.getTime())) {
          create.push(key);
          total++;
        }
      });
      create.sort();

      const remove: Array<string> = [];
      Object.keys(dst.entries).forEach(function (key) {
        if (!src.entries[key]) {
          remove.push(key);
          total++;
        }
      });
      remove.sort().reverse();

      if (!total) {
        return;
      }

      for (const path of create) {
        if (dst.type === "local") {
          const entry = await customFSAsync.loadRemoteEntry(path);
          customFSAsync.storeLocalEntry(path, entry);
        } else {
          const entry = customFSAsync.loadLocalEntry(path);
          await customFSAsync.storeRemoteEntry(path, entry);
        }
      }

      for (const path of remove) {
        if (dst.type === "local") {
          customFSAsync.removeLocalEntry(path);
        } else {
          await customFSAsync.removeRemoteEntry(path);
        }
      }
    },
  };

  FS.filesystems.CUSTOMFS_ASYNC = customFSAsync;

  // Mount the custom filesystem
  FS.mkdir('/customfs');
  FS.mount(FS.filesystems.CUSTOMFS_ASYNC, {}, '/customfs');

  // Sync the filesystem
  FS.syncfs(true, (err) => {
    if (err) {
      console.error('Error syncing filesystem:', err);
    } else {
      console.log('Filesystem synced successfully');
    }
  });
}

// Function to synchronize the filesystem to IndexedDB
const syncFilesystem = async (save = false) => {
  return new Promise<void>((resolve, reject) => {
    pyodide.FS.syncfs(save, (err: any) => {
      if (err) {
        console.error('syncfs error:', err);
        reject(err);
      } else {
        console.log(`syncfs ${save ? 'saved to' : 'loaded from'} IndexedDB`);
        resolve();
      }
    });
  });
};

// Message handler for the web worker
self.onmessage = async (event) => {
  switch (event.data?.type) {
    case 'run':
      console.time('total run time');
      try {
        // Initialize Pyodide if not already done
        await initialize();

        // Install dependencies
        await installDependencies(event.data.payload.code);

        // Run the Python code
        const runResult = await run(event.data.payload.code);

        // Synchronize the filesystem to save changes to IndexedDB
        await syncFilesystem(false); // Change to true to save changes

        // Post the successful run result
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
        // Post the error result
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

    default:
      console.warn('Unknown message type:', event.data?.type);
  }
};
