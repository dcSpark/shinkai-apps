import { loadPyodide, PyodideInterface } from 'pyodide';

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

# Redirect stdout to capture prints
old_stdout = sys.stdout
sys.stdout = mystdout = StringIO()

# Function to capture DataFrame display as HTML
def capture_df_display(df):
    return df.to_html()

output = None
outputError = None
fig_json = None
local_scope = {}
print("patat")
try:
    exec("""${code}""", globals(), local_scope)
    if 'output' in local_scope and isinstance(local_scope['output'], pd.DataFrame):
        output = capture_df_display(local_scope['output'])
    else:
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
            fig_json = pio.to_json(var_value)
            break
except Exception as e:
    outputError = str(e)

# Reset stdout
sys.stdout = old_stdout

(output, outputError, fig_json)
    `;
  return wrappedCode;
};
const runPythonCode = async (
  code: string,
): Promise<{ type: string; data: string }> => {
  const [output, outputError, figJson] = await pyodide.runPythonAsync(code);
  if (outputError) {
    throw new Error(outputError);
  }
  if (figJson) {
    return { type: 'plotly', data: figJson };
  }
  return { type: 'string', data: output };
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
    fullStdLib: true,
  });
  console.timeEnd('pyodide loading');

  console.time('pyodide loading packages');
  await pyodide.loadPackage(['micropip', 'pandas', 'numpy', 'matplotlib']);
  console.timeEnd('pyodide loading packages');

  console.time('importing micropip');
  const micropip = pyodide.pyimport('micropip');
  console.timeEnd('importing micropip');

  console.time('installing plotly');
  await micropip.install('plotly');
  console.timeEnd('installing plotly');

  console.time('installing seaborn');
  await micropip.install('seaborn');
  console.timeEnd('installing seaborn');
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
          },
        });
      } catch (e) {
        self.postMessage({
          type: 'run-done',
          payload: {
            state: 'error',
            stdout,
            stderr,
            message: String(e),
          },
        });
      } finally {
        console.timeEnd('total run time');
      }
      break;
  }
};
