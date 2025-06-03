import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  type AddFileToInboxResponse,
  type AddFileToJobRequest,
  type DirectoryContent,
} from '../__mocks__/shinkai-message-ts';
import {
  type FileSystemEntry,
  type IFileSystemService,
} from '../file-system-service';
import { JobService } from '../job-service';

type DownloadFileFn = (params: {
  nodeAddress: string;
  token: string;
  path: string;
}) => Promise<string>;
type AddFileToJobFn = (
  nodeAddress: string,
  bearerToken: string,
  payload: AddFileToJobRequest,
) => Promise<AddFileToInboxResponse>;

describe('JobService', () => {
  let mockFileSystemService: IFileSystemService & {
    initialize: ReturnType<typeof vi.fn>;
    readContents: ReturnType<typeof vi.fn>;
    readContentsWithMtime: ReturnType<typeof vi.fn>;
    writeFile: ReturnType<typeof vi.fn>;
    readFile: ReturnType<typeof vi.fn>;
    ensureDirectory: ReturnType<typeof vi.fn>;
    removeStaleItems: ReturnType<typeof vi.fn>;
    syncToIndexedDB: ReturnType<typeof vi.fn>;
    syncFromIndexedDB: ReturnType<typeof vi.fn>;
  };
  let mockDownloadFile: ReturnType<typeof vi.fn> & DownloadFileFn;
  let mockAddFileToJob: ReturnType<typeof vi.fn> & AddFileToJobFn;
  let jobService: JobService;

  beforeEach(() => {
    mockFileSystemService = {
      initialize: vi.fn(),
      readContents: vi.fn(),
      readContentsWithMtime: vi.fn(),
      writeFile: vi.fn(),
      readFile: vi.fn(),
      ensureDirectory: vi.fn(),
      removeStaleItems: vi.fn(),
      syncToIndexedDB: vi.fn(),
      syncFromIndexedDB: vi.fn(),
    } as IFileSystemService & {
      initialize: ReturnType<typeof vi.fn>;
      readContents: ReturnType<typeof vi.fn>;
      readContentsWithMtime: ReturnType<typeof vi.fn>;
      writeFile: ReturnType<typeof vi.fn>;
      readFile: ReturnType<typeof vi.fn>;
      ensureDirectory: ReturnType<typeof vi.fn>;
      removeStaleItems: ReturnType<typeof vi.fn>;
      syncToIndexedDB: ReturnType<typeof vi.fn>;
      syncFromIndexedDB: ReturnType<typeof vi.fn>;
    };

    mockDownloadFile = vi.fn().mockImplementation(async () => '') as ReturnType<
      typeof vi.fn
    > &
      DownloadFileFn;
    mockAddFileToJob = vi
      .fn()
      .mockImplementation(
        async () => ({}) as AddFileToInboxResponse,
      ) as ReturnType<typeof vi.fn> & AddFileToJobFn;

    jobService = new JobService({
      fileSystemService: mockFileSystemService,
      downloadFile: mockDownloadFile,
      addFileToJob: mockAddFileToJob,
      nodeAddress: 'test-node',
      token: 'test-token',
      jobId: 'test-job',
    });
  });

  describe('syncJobFilesToIDBFS', () => {
    const mockContents: DirectoryContent[] = [
      {
        name: 'file1.txt',
        path: 'file1.txt',
        is_directory: false,
        children: null,
        created_time: '2024-01-01T00:00:00Z',
        modified_time: '2024-01-01T00:00:00Z',
        has_embeddings: false,
        size: 100,
      },
      {
        name: 'dir1',
        path: 'dir1',
        is_directory: true,
        children: [
          {
            name: 'file2.txt',
            path: 'dir1/file2.txt',
            is_directory: false,
            children: null,
            created_time: '2024-01-01T00:00:00Z',
            modified_time: '2024-01-01T00:00:00Z',
            has_embeddings: false,
            size: 100,
          },
        ],
        created_time: '2024-01-01T00:00:00Z',
        modified_time: '2024-01-01T00:00:00Z',
        has_embeddings: false,
        size: 0,
      },
    ];

    it('should sync files correctly', async () => {
      mockFileSystemService.readContentsWithMtime.mockReturnValue([]);
      mockDownloadFile.mockResolvedValue('new content');

      await jobService.syncJobFilesToIDBFS(mockContents);

      expect(mockFileSystemService.removeStaleItems).toHaveBeenCalled();
      expect(mockFileSystemService.ensureDirectory).toHaveBeenCalledWith(
        '/home/pyodide/dir1',
      );
      expect(mockDownloadFile).toHaveBeenCalledWith({
        nodeAddress: 'test-node',
        token: 'test-token',
        path: 'file1.txt',
      });
      expect(mockFileSystemService.writeFile).toHaveBeenCalled();
      expect(mockFileSystemService.syncToIndexedDB).toHaveBeenCalled();
    });

    it('should skip unchanged files', async () => {
      mockFileSystemService.readFile.mockReturnValue('same content');
      mockDownloadFile.mockResolvedValue('same content');

      await jobService.syncJobFilesToIDBFS([
        {
          name: 'unchanged.txt',
          path: 'unchanged.txt',
          is_directory: false,
          children: null,
          created_time: '2024-01-01T00:00:00Z',
          modified_time: '2024-01-01T00:00:00Z',
          has_embeddings: false,
          size: 100,
        },
      ]);

      expect(mockFileSystemService.writeFile).not.toHaveBeenCalled();
    });

    it('should handle empty contents', async () => {
      await jobService.syncJobFilesToIDBFS(null);

      expect(mockFileSystemService.removeStaleItems).toHaveBeenCalledWith(
        '/home/pyodide',
        new Set(),
      );
      expect(mockFileSystemService.syncToIndexedDB).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      mockFileSystemService.removeStaleItems.mockImplementation(() => {
        throw new Error('Sync failed');
      });

      await expect(
        jobService.syncJobFilesToIDBFS(mockContents),
      ).rejects.toThrow('Sync failed');
    });
  });

  describe('compareAndUploadFiles', () => {
    const mockIDBFSContents: FileSystemEntry[] = [
      {
        name: 'file1.txt',
        type: 'file',
        content: 'new content',
        mtimeMs: Date.now() + 1000, // Future time to ensure it's newer
      },
      {
        name: 'dir1',
        type: 'directory',
        contents: [
          {
            name: 'file2.txt',
            type: 'file',
            content: 'old content',
            mtimeMs: Date.now() - 1000, // Past time to ensure it's older
          },
        ],
      },
    ];

    it('should upload changed files', async () => {
      mockFileSystemService.readContentsWithMtime.mockReturnValue(
        mockIDBFSContents,
      );
      mockAddFileToJob.mockResolvedValue({
        message: 'File uploaded successfully',
        filename: 'file1.txt',
      } as AddFileToInboxResponse);

      const timeBefore = Date.now();
      await jobService.compareAndUploadFiles(timeBefore);

      expect(mockAddFileToJob).toHaveBeenCalledWith(
        'test-node',
        'test-token',
        expect.objectContaining({
          filename: 'file1.txt',
          job_id: 'test-job',
        } as AddFileToJobRequest),
      );
    });

    it('should skip unchanged files', async () => {
      const oldTime = Date.now() - 1000;
      mockFileSystemService.readContentsWithMtime.mockReturnValue([
        {
          name: 'old.txt',
          type: 'file',
          content: 'old content',
          mtimeMs: oldTime,
        },
      ]);

      await jobService.compareAndUploadFiles(Date.now());

      expect(mockAddFileToJob).not.toHaveBeenCalled();
    });

    it('should handle empty IDBFS', async () => {
      mockFileSystemService.readContentsWithMtime.mockReturnValue(null);

      await jobService.compareAndUploadFiles(Date.now());

      expect(mockAddFileToJob).not.toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      mockFileSystemService.readContentsWithMtime.mockReturnValue(
        mockIDBFSContents,
      );
      mockAddFileToJob.mockRejectedValue(new Error('Upload failed'));

      const timeBefore = Date.now();
      await jobService.compareAndUploadFiles(timeBefore);

      // Should not throw error, just log it
      expect(mockAddFileToJob).toHaveBeenCalled();
    });
  });

  describe('syncFileToIDBFS', () => {
    it('should sync file correctly', async () => {
      mockDownloadFile.mockResolvedValue('file content');

      await jobService.syncFileToIDBFS({
        path: 'test.txt',
        name: 'test.txt',
      });

      expect(mockDownloadFile).toHaveBeenCalledWith({
        nodeAddress: 'test-node',
        token: 'test-token',
        path: 'test.txt',
      });
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        '/home/pyodide/test.txt',
        'file content',
      );
    });

    it('should sync file with nested path correctly', async () => {
      mockDownloadFile.mockResolvedValue('nested content');

      await jobService.syncFileToIDBFS({
        path: 'subdir/test.txt',
        name: 'test.txt',
      });

      expect(mockDownloadFile).toHaveBeenCalledWith({
        nodeAddress: 'test-node',
        token: 'test-token',
        path: 'subdir/test.txt',
      });
      expect(mockFileSystemService.ensureDirectory).toHaveBeenCalledWith(
        '/home/pyodide/subdir'
      );
      expect(mockFileSystemService.writeFile).toHaveBeenCalledWith(
        '/home/pyodide/subdir/test.txt',
        'nested content'
      );
    });

    it('should handle download errors', async () => {
      mockDownloadFile.mockRejectedValue(new Error('Download failed'));

      await expect(
        jobService.syncFileToIDBFS({
          path: 'test.txt',
          name: 'test.txt',
        }),
      ).rejects.toThrow('Download failed');
    });

    it('should handle write errors', async () => {
      mockDownloadFile.mockResolvedValue('file content');
      mockFileSystemService.writeFile.mockImplementation(() => {
        throw new Error('Write failed');
      });

      await expect(
        jobService.syncFileToIDBFS({
          path: 'test.txt',
          name: 'test.txt',
        }),
      ).rejects.toThrow('Write failed');
    });
  });
});
