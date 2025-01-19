import type { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';

import type { AddFileToInboxResponse, AddFileToJobRequest } from './__mocks__/shinkai-message-ts';
import { FileSystemEntry, IFileSystemService } from './file-system-service';

export interface IJobService {
  syncJobFilesToIDBFS(contents: DirectoryContent[] | null): Promise<void>;
  compareAndUploadFiles(timeBefore: number): Promise<void>;
  syncFileToIDBFS(item: { path: string; name: string }): Promise<void>;
}

export interface JobServiceDependencies {
  fileSystemService: IFileSystemService;
  downloadFile: (params: { nodeAddress: string; token: string; path: string }) => Promise<string>;
  addFileToJob: (nodeAddress: string, bearerToken: string, payload: AddFileToJobRequest) => Promise<AddFileToInboxResponse>;
  nodeAddress: string;
  token: string;
  jobId: string;
}

export class JobService implements IJobService {
  private fileSystemService: IFileSystemService;
  private downloadFile: (params: { nodeAddress: string; token: string; path: string }) => Promise<string>;
  private addFileToJob: (nodeAddress: string, bearerToken: string, payload: AddFileToJobRequest) => Promise<AddFileToInboxResponse>;
  private nodeAddress: string;
  private token: string;
  private jobId: string;

  constructor(dependencies: JobServiceDependencies) {
    this.fileSystemService = dependencies.fileSystemService;
    this.downloadFile = dependencies.downloadFile;
    this.addFileToJob = dependencies.addFileToJob;
    this.nodeAddress = dependencies.nodeAddress;
    this.token = dependencies.token;
    this.jobId = dependencies.jobId;
  }

  async syncJobFilesToIDBFS(contents: DirectoryContent[] | null): Promise<void> {
    console.time('Sync Job Files to IDBFS');
    try {
      // Log current state
      console.group('Initial State');
      console.log('Job Contents:', contents ? JSON.stringify(contents, null, 2) : 'empty');
      const currentIDBFSContents = this.fileSystemService.readContentsWithMtime('/home/pyodide');
      console.log('Current IDBFS Contents:', JSON.stringify(currentIDBFSContents, null, 2));
      console.groupEnd();

      // Create empty Set if no job contents
      const jobPathsSet = new Set<string>();
      if (contents) {
        for (const entry of contents) {
          const fullDirPath = `/home/pyodide/${entry.name}`;
          jobPathsSet.add(fullDirPath);
          if (!entry.is_directory) {
            jobPathsSet.add(fullDirPath);
          }
        }
      }

      // Remove everything not in jobPathsSet
      console.group('Removing Stale Items');
      this.fileSystemService.removeStaleItems('/home/pyodide', jobPathsSet);
      console.groupEnd();

      // Only proceed with syncing if we have job contents
      if (contents && contents.length > 0) {
        console.group('Syncing New/Updated Items');
        for (const entry of contents) {
          const fullPath = `/home/pyodide/${entry.name}`;
          
          if (entry.is_directory) {
            this.fileSystemService.ensureDirectory(fullPath);
          } else {
            const dirOnly = fullPath.substring(0, fullPath.lastIndexOf('/'));
            this.fileSystemService.ensureDirectory(dirOnly);
            
            const existingContent = this.fileSystemService.readFile(fullPath);
            
            if (existingContent) {
              // Compare with new content before syncing
              const currentContent = await this.downloadFile({
                nodeAddress: this.nodeAddress,
                token: this.token,
                path: entry.path,
              });
              
              if (existingContent === currentContent) {
                console.log(`File ${entry.name} content unchanged, skipping sync`);
                continue;
              }
            }

            await this.syncFileToIDBFS({
              path: entry.path,
              name: entry.name
            });
          }
        }
        console.groupEnd();
      }

      // Final sync to IndexedDB
      await this.fileSystemService.syncToIndexedDB();
      
      // Log final state
      console.log('Final IDBFS Contents:', JSON.stringify(this.fileSystemService.readContentsWithMtime('/home/pyodide'), null, 2));

    } catch (error) {
      console.error('Failed to sync job files:', error);
      throw error;
    }
  }

  private async traverseAndUpload(
    entries: FileSystemEntry[],
    basePath: string,
    timeBefore: number
  ): Promise<void> {
    for (const entry of entries) {
      const fullPath = `${basePath}/${entry.name}`;
      if (entry.type === 'file' && entry.mtimeMs !== undefined) {
        const mtimeInMs = entry.mtimeMs;
        if (mtimeInMs > timeBefore) {
          console.log(`Uploading changed file: ${fullPath}`);
          try {
            const blob = new Blob([entry.content ?? ''], { type: 'text/plain' });
            const file = new File([blob], entry.name, { type: 'text/plain' });
            await this.addFileToJob(this.nodeAddress, this.token, {
              filename: fullPath.replace('/home/pyodide/', ''),
              job_id: this.jobId,
              file,
            });
          } catch (error) {
            console.error(`Failed to upload file ${fullPath}:`, error);
          }
        }
      } else if (entry.type === 'directory' && entry.contents) {
        await this.traverseAndUpload(entry.contents, fullPath, timeBefore);
      }
    }
  }

  async compareAndUploadFiles(timeBefore: number): Promise<void> {
    console.time('Compare and Upload Files');
    try {
      const idbfsContents = this.fileSystemService.readContentsWithMtime('/home/pyodide');
      if (!idbfsContents) {
        console.warn('No contents found in /home/pyodide.');
        return;
      }

      await this.traverseAndUpload(idbfsContents, '/home/pyodide', timeBefore);
    } catch (error) {
      console.error('Failed to compare/upload files:', error);
    } finally {
      console.timeEnd('Compare and Upload Files');
    }
  }

  async syncFileToIDBFS(item: { path: string; name: string }): Promise<void> {
    try {
      const content = await this.downloadFile({
        nodeAddress: this.nodeAddress,
        token: this.token,
        path: item.path,
      });

      this.fileSystemService.writeFile(`/home/pyodide/${item.name}`, content);
      console.log(`Synced file ${item.name} to IDBFS`);
    } catch (error) {
      console.error(`Failed to sync file ${item.name}:`, error);
      throw error;
    }
  }
} 