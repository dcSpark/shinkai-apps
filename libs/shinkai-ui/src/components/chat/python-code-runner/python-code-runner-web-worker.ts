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

const getWrappedCode = (code: string): string => {
  const wrappedCode = `
import sys
from io import StringIO
import pandas as pd
import plotly.graph_objects as go
import plotly.express as px
import plotly.io as pio
import json
import array

import pyodide_http
pyodide_http.patch_all()

import urllib3
import requests

# Redirect stdout to capture prints
old_stdout = sys.stdout
mystdout = sys.stdout = StringIO()

# Function to capture DataFrame display as HTML
def capture_df_display(df):
    return df.to_html()

output = None
outputError = None
figures = []
local_scope = {}
try:
    exec("""${code}""", globals(), local_scope)

    # Capture the last variable in the scope
    last_var = list(local_scope.values())[-1] if local_scope else None
    if isinstance(last_var, pd.DataFrame):
        output = capture_df_display(last_var)
    elif isinstance(last_var, (str, int, float, list, dict)):
        output = json.dumps(last_var)
    else:
        output = mystdout.getvalue().strip()
    
    for var_name, var_value in local_scope.items():
        if isinstance(var_value, go.Figure):
            figures.append({ 'type': 'plotly', 'data': pio.to_json(var_value) })
        if isinstance(var_value, pd.DataFrame):
            figures.append({ 'type': 'html', 'data': capture_df_display(var_value) })        

except Exception as e:
    outputError = str(e)

# Reset stdout
sys.stdout = old_stdout
figures = json.dumps(figures)
(output, outputError, figures)
    `;
  return wrappedCode;
};
const runPythonCode = async (code: string): Promise<CodeOutput> => {
  const [output, outputError, figures] = await pyodide.runPythonAsync(code);
  if (outputError) {
    throw new Error(outputError);
  }
  return { rawOutput: output, figures: JSON.parse(figures) };
};

const run = async (code: string) => {
  if (!pyodide) {
    const error = new Error('pyodide is not initialized');
    throw error;
  }
  console.time('total execution');

  console.log('starting code execution');
  console.time('code wrapping');
  const wrappedCode = getWrappedCode(code);
  console.timeEnd('code wrapping');

  console.log('loading packages from imports');
  console.time('loading packages');
  await pyodide.loadPackagesFromImports(wrappedCode, {
    messageCallback: (message) => {
      console.log('load package message:', message);
    },
    errorCallback: (message) => {
      console.log('load package error:', message);
    },
  });
  console.timeEnd('loading packages');

  console.log('running Python code');
  console.time('python code execution');
  const result = await runPythonCode(wrappedCode);
  console.timeEnd('python code execution');

  console.log('pyodide run result:', result);

  console.timeEnd('total execution');
  return result;
};

const initialize = async () => {
  console.log('initializing pyodide');
  console.time('pyodide loading');
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
  console.timeEnd('pyodide loading');

  console.time('pyodide loading packages');
  await pyodide.loadPackage(['micropip', 'pandas', 'numpy', 'matplotlib']);
  console.timeEnd('pyodide loading packages');

  console.time('importing micropip');
  const micropip = pyodide.pyimport('micropip');
  console.timeEnd('importing micropip');

  const micropipLibs = [
    'plotly',
    'pyodide-http',
    'requests',
    'urllib3',
    'seaborn',
  ];
  console.log('Installing micropip libraries');
  for (const lib of micropipLibs) {
    console.time(`installing ${lib}`);
    await micropip.install(lib);
    console.timeEnd(`installing ${lib}`);
  }
  console.log('Finished installing micropip libraries');
  console.log('pyodide initialized successfully');
};

self.onmessage = async (event) => {
  switch (event.data?.type) {
    case 'run':
      console.time('total run time');
      try {
        await initialize();
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
