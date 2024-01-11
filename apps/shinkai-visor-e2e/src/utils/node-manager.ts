import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
export class NodeManager {
  private defaultNodeOptions = {
    FIRST_DEVICE_NEEDS_REGISTRATION_CODE: false,
    GLOBAL_IDENTITY_NAME: "@@localhost.shinkai",
    EMBEDDINGS_SERVER_URL: "https://internal.shinkai.com/x-embed-api/embed",
    UNSTRUCTURED_SERVER_URL: "https://internal.shinkai.com",
    NO_SECRET_FILE: true,
    NODE_STORAGE_PATH: path.join(__dirname, '../shinkai-node/db'),
    NODE_API_IP: '127.0.0.1',
    NODE_API_PORT: 9550,
  };

  private node: ChildProcess | undefined;

  constructor(private nodeExecPath: string) {}

  private async spawnNode(
    command: string,
    options: {
      readyMatcher?: RegExp;
      readyMatcherTimeoutMs?: number;
      pipeLogs: boolean;
    },
  ): Promise<ChildProcess> {
    console.log(`executing ${command}`);
    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, {
          detached: false,
          stdio: 'pipe',
          shell: true,
      });
      childProcess.on('close', (err) => {
        console.log(`Error spawning process with command ${command}`, err);
        reject(err);
      });
      
      if (options.pipeLogs) {
        childProcess.stdout?.pipe(process.stdout);
      }
      if (options.readyMatcher) {
        const timeoutRef = setTimeout(() => {
          childProcess.kill();
          reject(
            `ready matcher timeout after ${options.readyMatcherTimeoutMs}`,
          );
        }, options.readyMatcherTimeoutMs ?? 15000);
        childProcess.stdout?.on('data', (chunk: Buffer) => {
          if (options.readyMatcher?.test(chunk.toString())) {
            console.log(`Process ready, with readyMatcher:${chunk.toString()}`);
            clearTimeout(timeoutRef);
            resolve(childProcess);
          }
        });
      } else {
        resolve(childProcess);
      }
    });
  }

  async startNode(pristine: boolean, nodeOptions?: object): Promise<void> {
    console.log('starting node');
    const mergedOptions = { ...this.defaultNodeOptions, ...(nodeOptions || {}) };
    if (pristine) {
      fs.rmSync(mergedOptions.NODE_STORAGE_PATH, { recursive: true, force: true });
    }
    const nodeEnv = Object.entries(mergedOptions).map(([key, value]) => {
      return `${key}="${value}"`;
    }).join(' ');

    this.node = await this.spawnNode(`${nodeEnv} ${this.nodeExecPath}`, {
      pipeLogs: true,
      readyMatcher: /Starting Node API server/
    });
    console.log('node started');
  }

  async stopNode(): Promise<void> {
    console.log('stopping node');
    this.node?.kill();
    this.node = undefined;
  }
}
