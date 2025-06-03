import { type PyodideInterface } from 'pyodide';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PyodideFileSystemService } from '../file-system-service';

type FSCallback = (error: Error | null) => void;
type MockStats = { [key: string]: { mode: number } };

describe('PyodideFileSystemService', () => {
  let mockPyodide: PyodideInterface;
  let service: PyodideFileSystemService;

  beforeEach(() => {
    // Create mock Pyodide instance
    mockPyodide = {
      FS: {
        mount: vi.fn(),
        readdir: vi.fn(),
        stat: vi.fn(),
        isDir: vi.fn(),
        readFile: vi.fn(),
        writeFile: vi.fn(),
        unlink: vi.fn(),
        mkdir: vi.fn(),
        rmdir: vi.fn(),
        syncfs: vi.fn(),
        filesystems: {
          IDBFS: 'IDBFS',
        },
      },
    } as unknown as PyodideInterface;

    service = new PyodideFileSystemService(mockPyodide);
  });

  describe('initialize', () => {
    it('should mount IDBFS and sync from IndexedDB', async () => {
      mockPyodide.FS.syncfs.mockImplementation(
        // @ts-expect-error unused-vars
        (populate: boolean, callback: FSCallback) => callback(null),
      );

      await service.initialize();

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

    it('should throw error if mounting fails', async () => {
      mockPyodide.FS.mount.mockImplementation(() => {
        throw new Error('Mount failed');
      });

      await expect(service.initialize()).rejects.toThrow('Mount failed');
    });

    it('should throw error if sync fails', async () => {
      mockPyodide.FS.syncfs.mockImplementation(
        // @ts-expect-error unused-vars
        (populate: boolean, callback: FSCallback) =>
          callback(new Error('Sync failed')),
      );

      await expect(service.initialize()).rejects.toThrow('Sync failed');
    });
  });

  describe('readContents', () => {
    it('should read directory contents correctly', () => {
      const mockEntries = ['file1.txt', 'dir1', '.', '..', '.matplotlib'];
      const mockStats: MockStats = {
        'file1.txt': { mode: 0o100644 }, // regular file
        dir1: { mode: 0o040000 }, // directory
      };

      // Mock first readdir call for root directory
      mockPyodide.FS.readdir.mockImplementation((path: string) => {
        if (path === '/test') {
          return mockEntries;
        }
        // Return empty directory for recursive calls
        return ['.', '..'];
      });

      mockPyodide.FS.stat.mockImplementation((path: string) => {
        const name = path.split('/').pop() || '';
        const stat = mockStats[name];
        if (!stat) {
          throw new Error(`No mock stat for ${name}`);
        }
        return stat;
      });
      mockPyodide.FS.isDir.mockImplementation(
        (mode: number) => mode === 0o040000,
      );
      mockPyodide.FS.readFile.mockReturnValue('file content');

      const result = service.readContents('/test');

      expect(result).toEqual([
        {
          name: 'file1.txt',
          type: 'file',
          content: 'file content',
        },
        {
          name: 'dir1',
          type: 'directory',
          contents: [], // Empty array since we mock empty directory for recursive calls
        },
      ]);
    });

    it('should handle errors and return null', () => {
      mockPyodide.FS.readdir.mockImplementation(() => {
        throw new Error('Read failed');
      });

      const result = service.readContents('/test');

      expect(result).toBeNull();
    });
  });

  describe('writeFile', () => {
    it('should write file content correctly', () => {
      service.writeFile('/test/file.txt', 'content');

      expect(mockPyodide.FS.writeFile).toHaveBeenCalledWith(
        '/test/file.txt',
        'content',
        { encoding: 'utf8' },
      );
    });

    it('should throw error if write fails', () => {
      mockPyodide.FS.writeFile.mockImplementation(() => {
        throw new Error('Write failed');
      });

      expect(() => service.writeFile('/test/file.txt', 'content')).toThrow(
        'Write failed',
      );
    });
  });

  describe('ensureDirectory', () => {
    it('should create directory structure correctly', () => {
      mockPyodide.FS.stat.mockImplementation(() => {
        throw new Error('Not found');
      });

      service.ensureDirectory('/test/dir1/dir2');

      expect(mockPyodide.FS.mkdir).toHaveBeenCalledWith('/test');
      expect(mockPyodide.FS.mkdir).toHaveBeenCalledWith('/test/dir1');
      expect(mockPyodide.FS.mkdir).toHaveBeenCalledWith('/test/dir1/dir2');
    });

    it('should handle existing directories', () => {
      mockPyodide.FS.stat.mockReturnValue({ mode: 0o040000 });
      mockPyodide.FS.isDir.mockReturnValue(true);

      service.ensureDirectory('/test/dir1/dir2');

      expect(mockPyodide.FS.mkdir).not.toHaveBeenCalled();
    });

    it('should replace file with directory if path exists as file', () => {
      mockPyodide.FS.stat.mockReturnValue({ mode: 0o100644 });
      mockPyodide.FS.isDir.mockReturnValue(false);

      service.ensureDirectory('/test/dir1');

      expect(mockPyodide.FS.unlink).toHaveBeenCalledWith('/test/dir1');
      expect(mockPyodide.FS.mkdir).toHaveBeenCalledWith('/test/dir1');
    });
  });

  describe('removeStaleItems', () => {
    it('should remove files and directories not in validPaths', () => {
      const validPaths = new Set(['/home/pyodide/keep.txt']);

      // Mock readdir to return different results for different paths
      mockPyodide.FS.readdir.mockImplementation((path: string) => {
        if (path === '/home/pyodide') {
          return ['keep.txt', 'remove.txt', 'dir1'];
        }
        // Return empty directory for recursive calls
        return ['.', '..'];
      });

      const mockStats: MockStats = {
        'keep.txt': { mode: 0o100644 },
        'remove.txt': { mode: 0o100644 },
        dir1: { mode: 0o040000 },
      };

      mockPyodide.FS.stat.mockImplementation((path: string) => {
        const name = path.split('/').pop() || '';
        const stat = mockStats[name];
        if (!stat) {
          // Return a regular file stat for unknown paths to prevent recursion
          return { mode: 0o100644 };
        }
        return stat;
      });
      mockPyodide.FS.isDir.mockImplementation(
        (mode: number) => mode === 0o040000,
      );

      service.removeStaleItems('/home/pyodide', validPaths);

      expect(mockPyodide.FS.unlink).toHaveBeenCalledWith(
        '/home/pyodide/remove.txt',
      );
      expect(mockPyodide.FS.rmdir).toHaveBeenCalledWith('/home/pyodide/dir1');
      expect(mockPyodide.FS.unlink).not.toHaveBeenCalledWith(
        '/home/pyodide/keep.txt',
      );
    });
  });

  describe('syncToIndexedDB', () => {
    it('should sync to IndexedDB successfully', async () => {
      mockPyodide.FS.syncfs.mockImplementation(
        // @ts-expect-error unused-vars
        (populate: boolean, callback: FSCallback) => callback(null),
      );

      await service.syncToIndexedDB();

      expect(mockPyodide.FS.syncfs).toHaveBeenCalledWith(
        false,
        expect.any(Function),
      );
    });

    it('should handle sync errors', async () => {
      mockPyodide.FS.syncfs.mockImplementation(
        // @ts-expect-error unused-vars
        (populate: boolean, callback: FSCallback) =>
          callback(new Error('Sync failed')),
      );

      await expect(service.syncToIndexedDB()).rejects.toThrow('Sync failed');
    });
  });

  describe('syncFromIndexedDB', () => {
    it('should sync from IndexedDB successfully', async () => {
      mockPyodide.FS.syncfs.mockImplementation(
        // @ts-expect-error unused-vars
        (populate: boolean, callback: FSCallback) => callback(null),
      );

      await service.syncFromIndexedDB();

      expect(mockPyodide.FS.syncfs).toHaveBeenCalledWith(
        true,
        expect.any(Function),
      );
    });

    it('should handle sync errors', async () => {
      mockPyodide.FS.syncfs.mockImplementation(
        // @ts-expect-error unused-vars
        (populate: boolean, callback: FSCallback) =>
          callback(new Error('Sync failed')),
      );

      await expect(service.syncFromIndexedDB()).rejects.toThrow('Sync failed');
    });
  });
});
