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

// Add this at the top of the file, outside of any function
class MockRemoteStorage {
  private storage: Map<string, any> = new Map();

  async getItem(key: string): Promise<any> {
    console.log(`MockRemoteStorage: Getting item with key "${key}"`);
    const value = this.storage.get(key);
    console.log(`MockRemoteStorage: Retrieved value for key "${key}":`, value);
    return value;
  }

  async setItem(key: string, value: any): Promise<void> {
    console.log(`MockRemoteStorage: Setting item with key "${key}"`, value);
    this.storage.set(key, value);
    console.log(`MockRemoteStorage: Set value for key "${key}"`);
  }

  async removeItem(key: string): Promise<void> {
    console.log(`MockRemoteStorage: Removing item with key "${key}"`);
    const deleted = this.storage.delete(key);
    console.log(
      `MockRemoteStorage: Item with key "${key}" ${deleted ? 'removed' : 'not found'}`,
    );
  }

  async clear(): Promise<void> {
    console.log('MockRemoteStorage: Clearing all items');
    this.storage.clear();
    console.log('MockRemoteStorage: All items cleared');
  }

  async keys(): Promise<string[]> {
    console.log('MockRemoteStorage: Getting all keys');
    const keys = Array.from(this.storage.keys());
    console.log('MockRemoteStorage: Retrieved keys:', keys);
    return keys;
  }
}

const mockRemoteStorage = new MockRemoteStorage();

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
      console.log('main thread> dataArray', dataArray);
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

  // simpleFS(pyodide);
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

  // Keep a reference to the original MEMFS methods
  const originalNodeOps = MEMFS.node_ops;
  const originalStreamOps = MEMFS.stream_ops;

  // Create custom node_ops with logging
  const customNodeOps = {
    ...originalNodeOps,
    lookup: (parent: any, name: any) => {
      console.log(`customNodeOps> Looking up: ${name} in parent: ${parent}`);
      return originalNodeOps.lookup(parent, name);
    },
    // Add more methods with logging as needed
  };

  // Create custom stream_ops with logging
  const customStreamOps = {
    ...originalStreamOps,
    read: (
      stream: any,
      buffer: any,
      offset: any,
      length: any,
      position: any,
    ) => {
      console.log(
        `customStreamOps> Reading from stream at position: ${position}`,
      );
      return originalStreamOps.read(stream, buffer, offset, length, position);
    },
    // Add more methods with logging as needed
  };

  const customFSAsync = {
    DIR_MODE: 16384 | 511, // DIR_MODE: {{{ cDefine('S_IFDIR') }}} | 511 /* 0777 */,
    FILE_MODE: 32768 | 511, // FILE_MODE: {{{ cDefine('S_IFREG') }}} | 511 /* 0777 */,

    mount(mount: any) {
      console.log('customFSAsync> Mounting CustomFS');
      // Create the root node
      const rootNode = MEMFS.createNode(null, '/', customFSAsync.DIR_MODE, 0);
      rootNode.node_ops = customNodeOps;
      rootNode.stream_ops = customStreamOps;
      return rootNode;
    },
    node_ops: customNodeOps,
    stream_ops: customStreamOps,

    syncLocalToRemote(
      _mount: any,
      local: { entries: Record<string, FileSystemEntry> },
      remote: { entries: Record<string, FileSystemEntry> },
    ) {
      console.log('syncLocalToRemote> Syncing from local to remote');
      console.log('syncLocalToRemote> local', local);
      console.log('syncLocalToRemote> remote', remote);

      let create: Record<string, FileSystemEntry> = {};
      const remove: Record<string, FileSystemEntry> = {};

      create = local.entries;

      // TODO: fix this once we have remote working
      // Object.keys(local.entries).forEach((key) => {
      //   console.log('syncLocalToRemote> key', key);
      //   const localEntry = local.entries[key];
      //   const remoteEntry = remote.entries[key];
      //   if (
      //     !remoteEntry ||
      //     (FS.isFile(localEntry.mode) &&
      //       localEntry.timestamp.getTime() > remoteEntry.timestamp.getTime())
      //   ) {
      //     create.push(key);
      //   }
      // });

      // Object.keys(remote.entries).forEach((key) => {
      //   console.log('syncLocalToRemote> key', key);
      //   if (!local.entries[key]) {
      //     remove.push(key);
      //   }
      // });

      this.sendSyncMessage('sync-local-to-remote', create, remove);
    },

    syncRemoteToLocal(
      mount: any,
      local: { entries: Record<string, FileSystemEntry> },
      remote: { entries: Record<string, FileSystemEntry> },
    ) {
      console.log('syncRemoteToLocal> Syncing from remote to local');
      const create: Record<string, FileSystemEntry> = {};
      const remove: Record<string, FileSystemEntry> = {};

      // this.sendSyncMessage('sync-remote-to-local', create, remove);
    },

    sendSyncMessage(
      type: string,
      // TODO:L change to array so we can use the sharedbuffer and match the order
      create: Record<string, FileSystemEntry>,
      remove: Record<string, FileSystemEntry>,
    ) {
      const bufferSize = 512 * 1024; // Define buffer size
      const sharedBuffer = new SharedArrayBuffer(bufferSize);
      const syncArray = new Int32Array(sharedBuffer, 0, 1);
      const dataArray = new Uint8Array(sharedBuffer, 4);

      const message = {
        type,
        create,
        remove,
        sharedBuffer,
      };

      console.log('Message to be sent:', message); // Print the message

      try {
        self.postMessage(message);

        console.log(
          `${type}> Posted sync message to main thread, waiting for response...`,
        );

        const textDecoder = new TextDecoder();
        let result = '';

        // Busy-wait loop
        while (syncArray[0] === 0) {
          // This loop will block the thread until syncArray[0] changes
        }

        console.log(`${type}> Polling done with status: `, syncArray[0]);

        if (syncArray[0] === -1) {
          const errorMessage = textDecoder.decode(dataArray);
          console.error(`${type}> Error during sync:`, errorMessage);
          throw new Error(errorMessage);
        }

        // Read the response
        const response = textDecoder
          .decode(dataArray)
          .replace(/\0/g, '')
          .trim();
        result += response;

        console.log(`${type}> Received sync data of length: ${result.length}`);
        console.log(`${type}> result: `, result);

        const entries = JSON.parse(result);
        console.log(`${type}> entries: `, entries);
        // Process the entries as needed
      } catch (e) {
        console.error(`An error occurred during ${type}:`, e);
        throw new Error(
          `Failed to ${type}: ` +
            (e instanceof Error ? e.message : 'Unknown error'),
        );
      }
    },

    syncfs: async (
      mount: any,
      populate: boolean,
      callback: (error: any) => void,
    ) => {
      console.log('customFSAsync> Syncing CustomFS');
      try {
        const local = customFSAsync.getLocalSet(mount);
        const remote = await customFSAsync.getRemoteSet(mount);
        if (populate) {
          customFSAsync.syncRemoteToLocal(mount, local, remote);
        } else {
          customFSAsync.syncLocalToRemote(mount, local, remote);
        }
        callback(null);
      } catch (e) {
        callback(e);
      }
    },
    getLocalSet: (mount: any) => {
      console.log('customFSAsync> Getting local set from /home/pyodide');
      const entries = Object.create(null);

      function isRealDir(p: string) {
        return p !== '.' && p !== '..';
      }

      function toAbsolute(root: string) {
        return (p: string) => PATH.join2(root, p);
      }

      console.log('customFSAsync> Reading directory: /home/pyodide');
      // Start from the /home/pyodide directory
      const check = FS.readdir('/home/pyodide')
        .filter(isRealDir)
        .map(toAbsolute('/home/pyodide'));

      // Print all folders and files at the real root level
      const rootEntries = FS.readdir('/').filter(isRealDir);
      const rootFolders: Array<string> = [];
      const rootFiles: Array<string> = [];

      rootEntries.forEach((entry: string) => {
        const path = PATH.join2('/', entry);
        const stat = FS.stat(path);
        if (FS.isDir(stat.mode)) {
          rootFolders.push(entry);
        } else if (FS.isFile(stat.mode)) {
          rootFiles.push(entry);
        }
      });

      console.log('getLocalSet> Real root level folders:', rootFolders);
      console.log('getLocalSet> Real root level files:', rootFiles);

      // Function to print contents of a directory
      function printDirectoryContents(dirPath: string) {
        try {
          const entries = FS.readdir(dirPath).filter(isRealDir);
          const folders: Array<string> = [];
          const files: Array<string> = [];

          entries.forEach((entry: string) => {
            const path = PATH.join2(dirPath, entry);
            const stat = FS.stat(path);
            if (FS.isDir(stat.mode)) {
              check.push(
                ...FS.readdir(path).filter(isRealDir).map(toAbsolute(path)),
              );
              entries[path] = {
                timestamp: stat.mtime,
                mode: stat.mode,
                type: 'folder',
              };
            } else if (FS.isFile(stat.mode)) {
              entries[path] = {
                timestamp: stat.mtime,
                mode: stat.mode,
                type: 'file',
              };
            }
          });

          console.log(`getLocalSet> Folders in ${dirPath}:`, folders);
          console.log(`getLocalSet> Files in ${dirPath}:`, files);
        } catch (error) {
          console.error(`Error reading ${dirPath} directory:`, error);
        }
      }

      // Print contents inside the /home/pyodide directory
      printDirectoryContents('/home/pyodide');

      while (check.length) {
        const path = check.pop();
        console.log(`getLocalSet> Checking path: ${path}`);
        const stat = FS.stat(path);
        console.log('getLocalSet> stat', stat);

        if (FS.isDir(stat.mode)) {
          check.push(
            ...FS.readdir(path).filter(isRealDir).map(toAbsolute(path)),
          );
          entries[path] = {
            timestamp: stat.mtime,
            mode: stat.mode,
            type: 'folder',
          };
        } else if (FS.isFile(stat.mode)) {
          entries[path] = {
            timestamp: stat.mtime,
            mode: stat.mode,
            type: 'file',
          };
        } else {
          console.warn(`getLocalSet> Unknown type for path: ${path}`);
        }

        // Add the entry to the entries object
        console.log('getLocalSet> Adding entry to entries:', path);
        console.log('getLocalSet> Entry:', {
          timestamp: stat.mtime,
          mode: stat.mode,
          type: entries[path].type,
        });
        entries[path] = {
          timestamp: stat.mtime,
          mode: stat.mode,
          type: entries[path].type,
        };
      }

      console.log('getLocalSet> Entries from /home/pyodide:', entries);
      return { type: 'local', entries: entries };
    },
    getRemoteSet: async (mount: any) => {
      console.log('customFSAsync> Getting remote set');
      // Deep log the mount object
      const seen = new WeakSet();
      const mountString = JSON.stringify(
        mount,
        (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          return value;
        },
        2,
      );

      console.log('main thread> mount', mountString);
      const bufferSize = 512 * 1024; // Define buffer size
      const sharedBuffer = new SharedArrayBuffer(bufferSize);
      const syncArray = new Int32Array(sharedBuffer, 0, 1);
      const dataArray = new Uint8Array(sharedBuffer, 4);

      console.log('sending get-remote-set message to main thread');

      try {
        // Send message to main thread
        self.postMessage({
          type: 'get-remote-set',
          mount: mountString,
          sharedBuffer,
        });

        console.log(
          'Posted get-remote-set message to main thread, waiting for response...',
        );
      } catch (error) {
        console.error('Error posting message to main thread:', error);
      }

      const textDecoder = new TextDecoder();
      let result = '';

      // Busy-wait loop
      while (syncArray[0] === 0) {
        // This loop will block the thread until syncArray[0] changes
      }

      console.log('Polling done with status: ', syncArray[0]);

      if (syncArray[0] === -1) {
        const errorMessage = textDecoder.decode(dataArray);
        console.error('getRemoteSet> Error getting remote set:', errorMessage);
        throw new Error(errorMessage);
      }

      // Read the response
      const response = textDecoder.decode(dataArray).replace(/\0/g, '').trim();
      result += response;

      console.log(
        `getRemoteSet> Received remote set data of length: ${result.length}`,
      );
      console.log('getRemoteSet> result: ', result);

      const entries = JSON.parse(result);
      return { type: 'remote', entries };
    },
  };

  // Mount the custom filesystem
  try {
    FS.mkdir('/customfs');
    FS.mount(customFSAsync, { root: '.' }, '/customfs');
  } catch (e) {
    if (e instanceof Error && (e as any).code !== 'EEXIST') {
      console.error('Error creating /customfs directory:', e);
    }
  }

  // Sync the filesystem
  FS.syncfs(true, (err: any) => {
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
    console.log('syncFilesystem', save);
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
