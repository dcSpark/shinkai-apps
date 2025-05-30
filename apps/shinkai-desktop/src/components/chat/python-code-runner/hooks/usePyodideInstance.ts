import { loadPyodide, type PyodideInterface } from 'pyodide';
import { useCallback, useRef } from 'react';

import { type IFileSystemService, PyodideFileSystemService } from '../services/file-system-service';

export function usePyodideInstance() {
  const pyodideRef = useRef<PyodideInterface | null>(null);
  const fileSystemServiceRef = useRef<IFileSystemService | null>(null);

  const initializePyodide = useCallback(async () => {
    if (pyodideRef.current) {
      console.log('Pyodide is already initialized.');
      return { pyodide: pyodideRef.current, fileSystemService: fileSystemServiceRef.current! };
    }

    console.time('initialize pyodide');
    const pyodide = await loadPyodide({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      stdout: console.log,
      stderr: console.error,
    });
    console.log('Pyodide initialized');

    pyodideRef.current = pyodide;
    fileSystemServiceRef.current = new PyodideFileSystemService(pyodide);

    try {
      await fileSystemServiceRef.current.initialize();
    } catch (error) {
      console.error('Failed to initialize file system:', error);
      throw error;
    }

    console.timeEnd('initialize pyodide');
    return { pyodide, fileSystemService: fileSystemServiceRef.current };
  }, []);

  return {
    pyodide: pyodideRef.current,
    fileSystemService: fileSystemServiceRef.current,
    initializePyodide,
  };
} 