import { emit, Event, listen } from '@tauri-apps/api/event';
import { loadPyodide, PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface;
let isLoaded = false;

listen('run', async (event: Event<string>) => {
  console.log('Received run event');
  if (!isLoaded) {
    console.log('Pyodide is not loaded yet, emitting error');
    emit('execution-result', { state: 'error', payload: 'Pyodide is still loading. Please try again in a moment.' });
    return;
  }
  try {
    console.log('Loading packages from imports');
    await pyodide.loadPackagesFromImports(event.payload);
    console.log('Running Python code');
    const result = await pyodide.runPythonAsync(event.payload);
    console.log('Pyodide run result', result);
    emit('execution-result', { state: 'success', payload: result });
  } catch (e) {
    console.error('Pyodide run error', e);
    emit('execution-result', { state: 'error', payload: e });
  }
});

const loadPackages = async (pyodideInstance: PyodideInterface) => {
  const packages = ['pandas', 'numpy', 'matplotlib', 'plotly', 'seaborn'];

  console.log('Setting up micropip');
  emit('loading-progress', { step: 'micropip', progress: 0 });
  try {
    await pyodideInstance.loadPackage('micropip');
    const micropip = pyodideInstance.pyimport('micropip');
    console.log('micropip loaded successfully');
    emit('loading-progress', { step: 'micropip', progress: 100 });

    for (const pkg of packages) {
      console.log(`Starting to install ${pkg}`);
      emit('loading-progress', { step: pkg, progress: 0 });
      try {
        await micropip.install(pkg);
        console.log(`Finished installing ${pkg}`);
        emit('loading-progress', { step: pkg, progress: 100 });
      } catch (error) {
        console.error(`Error installing ${pkg}:`, error);
        emit('loading-progress', { step: pkg, progress: -1 }); // Use -1 to indicate error
      }
    }

    // Load packages that require loadPackage
    console.log('Loading additional packages');
    emit('loading-progress', { step: 'additional', progress: 0 });
    await pyodideInstance.loadPackage(['numpy', 'pandas']);
    console.log('Additional packages loaded');
    emit('loading-progress', { step: 'additional', progress: 100 });

  } catch (error) {
    console.error('Error setting up micropip:', error);
    emit('loading-progress', { step: 'micropip', progress: -1 });
    throw error; // Rethrow to handle in the main function
  }
};

const main = async (retryCount = 3) => {
  try {
    console.log('Starting to load Pyodide');
    emit('loading-progress', { step: 'pyodide', progress: 0 });
    pyodide = await loadPyodide({
      indexURL: "/pyodide",
      fullStdLib: false,
    });
    console.log('Pyodide loaded successfully');
    emit('loading-progress', { step: 'pyodide', progress: 100 });

    console.log('Starting to load additional packages');
    await loadPackages(pyodide);
    console.log('All packages loaded successfully');

    isLoaded = true;
    console.log('Pyodide environment is fully loaded and ready');
    emit('ready');
  } catch (e) {
    console.error('Pyodide load error', e);
    if (retryCount > 0) {
      console.log(`Retrying to load Pyodide... (${retryCount} attempts left)`);
      setTimeout(() => main(retryCount - 1), 1000);
    } else {
      console.error('Failed to load Pyodide after multiple attempts.');
      emit('loading-error');
    }
  }
};

main();
