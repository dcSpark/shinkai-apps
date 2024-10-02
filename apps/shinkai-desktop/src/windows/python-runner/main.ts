import { emit, Event, listen } from '@tauri-apps/api/event';
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
fig_json = None
local_scope = {}
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
    output = str(e)

# Reset stdout
sys.stdout = old_stdout

(output, fig_json)
    `;
  return wrappedCode;
};
const runPythonCode = async (
  code: string,
): Promise<{ type: string; data: string }> => {
  const [output, figJson] = await pyodide.runPythonAsync(code);
  if (figJson) {
    return { type: 'plotly', data: figJson };
  }
  return { type: 'string', data: output };
};

listen('run', async (event: Event<string>) => {
  if (!pyodide) {
    const error = new Error('pyodide is not initialized');
    emit('execution-error', error);
    throw error;
  }
  try {
    const code = getWrappedCode(event.payload);
    console.log('executing code', code);
    await pyodide.loadPackagesFromImports(code, {
      messageCallback: (message) => {
        console.log('load package message', message);
      },
      errorCallback: (message) => {
        console.log('load package error', message);
      },
    });
    console.log('packages loaded');
    const result = await runPythonCode(code);
    console.log('pyodide run result', result);
    emit('execution-result', {
      state: 'success',
      stdout,
      stderr,
      payload: result,
    });
  } catch (e) {
    console.log('pyodide run error', e);
    emit('execution-result', { state: 'error', stdout, stderr, payload: e });
  }
});

const main = async () => {
  try {
    console.log('loading pyodide');
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
    });
    await pyodide.loadPackage(['micropip', 'pandas', 'numpy', 'matplotlib']);
    const micropip = pyodide.pyimport('micropip');
    await micropip.install('plotly');
    await micropip.install('seaborn');
    console.log('pyodide loaded successfully');
    emit('ready');
  } catch (e) {
    console.log('pyodide load error', e);
    emit('loading-error');
    return;
  }
};
main();
