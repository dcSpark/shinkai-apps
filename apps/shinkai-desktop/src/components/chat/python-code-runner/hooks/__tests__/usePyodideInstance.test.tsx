import { renderHook } from '@testing-library/react';
import { loadPyodide, PyodideInterface } from 'pyodide';

import { usePyodideInstance } from '../usePyodideInstance';

// Mock pyodide
jest.mock('pyodide', () => ({
  loadPyodide: jest.fn(),
}));

describe('usePyodideInstance', () => {
  let mockPyodide: jest.Mocked<PyodideInterface>;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create mock Pyodide instance
    mockPyodide = {
      FS: {
        mount: jest.fn(),
        readdir: jest.fn(),
        stat: jest.fn(),
        isDir: jest.fn(),
        readFile: jest.fn(),
        writeFile: jest.fn(),
        unlink: jest.fn(),
        mkdir: jest.fn(),
        rmdir: jest.fn(),
        syncfs: jest.fn(),
        filesystems: {
          IDBFS: 'IDBFS',
        },
      },
    } as unknown as jest.Mocked<PyodideInterface>;

    // Mock loadPyodide to return our mock instance
    (loadPyodide as jest.Mock).mockResolvedValue(mockPyodide);
  });

  it('should initialize Pyodide and file system service', async () => {
    mockPyodide.FS.syncfs.mockImplementation(
      // @ts-expect-error populate
      (populate: boolean, callback: (err: Error | null) => void) =>
        callback(null),
    );

    const { result } = renderHook(() => usePyodideInstance());

    // Initially, both pyodide and fileSystemService should be null
    expect(result.current.pyodide).toBeNull();
    expect(result.current.fileSystemService).toBeNull();

    // Initialize
    const { pyodide, fileSystemService } =
      await result.current.initializePyodide();

    // After initialization
    expect(pyodide).toBe(mockPyodide);
    expect(fileSystemService).toBeDefined();
    expect(loadPyodide).toHaveBeenCalledWith({
      indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.2/full/',
      stdout: console.log,
      stderr: console.error,
    });
    expect(mockPyodide.FS.mount).toHaveBeenCalledWith(
      'IDBFS',
      {},
      '/home/pyodide',
    );
    expect(mockPyodide.FS.syncfs).toHaveBeenCalledWith(
      true,
      expect.any(Function),
    );
  });

  it('should reuse existing Pyodide instance', async () => {
    mockPyodide.FS.syncfs.mockImplementation(
      // @ts-expect-error populate
      (populate: boolean, callback: (err: Error | null) => void) =>
        callback(null),
    );

    const { result } = renderHook(() => usePyodideInstance());

    // First initialization
    const first = await result.current.initializePyodide();
    expect(loadPyodide).toHaveBeenCalledTimes(1);

    // Second initialization
    const second = await result.current.initializePyodide();
    expect(loadPyodide).toHaveBeenCalledTimes(1); // Should not be called again
    expect(second.pyodide).toBe(first.pyodide);
    expect(second.fileSystemService).toBe(first.fileSystemService);
  });

  it('should handle initialization errors', async () => {
    (loadPyodide as jest.Mock).mockRejectedValue(
      new Error('Failed to load Pyodide'),
    );

    const { result } = renderHook(() => usePyodideInstance());

    await expect(result.current.initializePyodide()).rejects.toThrow(
      'Failed to load Pyodide',
    );
  });

  it('should handle file system initialization errors', async () => {
    mockPyodide.FS.syncfs.mockImplementation(
      // @ts-expect-error populate
      (populate: boolean, callback: (err: Error | null) => void) =>
        callback(new Error('Sync failed')),
    );

    const { result } = renderHook(() => usePyodideInstance());

    await expect(result.current.initializePyodide()).rejects.toThrow(
      'Sync failed',
    );
  });
});
