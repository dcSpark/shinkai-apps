import { emit, Event, listen } from '@tauri-apps/api/event';
import { loadPyodide, PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface;

listen('run', async (event: Event<string>) => {
  if (!pyodide) {
    const error = new Error('pyodide is not initialized');
    emit('execution-error', error);
    throw error;
  }
  try {
    await pyodide.loadPackagesFromImports(event.payload);
    const result = await pyodide.runPythonAsync(event.payload);
    console.log('pyodide run result', result);
    emit('execution-result', { state: 'success', payload: result });
  } catch (e) {
    console.log('pyodide run error', e);
    emit('execution-result', { state: 'error', payload: e });
  }
});

const main = async () => {
  try {
    console.log('loading pyodide');
    pyodide = await loadPyodide({
      indexURL: "/pyodide",
    });
    console.log('pyodide loaded successfully');

    // Load micropip
    await pyodide.loadPackage('micropip');
    console.log('micropip loaded successfully');

    // Use micropip to install numpy
    await pyodide.runPythonAsync(`
      import micropip
      await micropip.install('numpy')
    `);
    console.log('numpy loaded successfully');

    emit('ready');
  } catch (e) {
    console.log('pyodide load error', e);
    emit('loading-error');
    return;
  }
};
main();
