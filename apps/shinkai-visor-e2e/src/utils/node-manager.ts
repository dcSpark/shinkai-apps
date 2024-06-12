import { ChildProcess, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class NodeManager {
  private defaultNodeOptions = {
    FIRST_DEVICE_NEEDS_REGISTRATION_CODE: false,
    GLOBAL_IDENTITY_NAME: '@@localhost.shinkai',
    EMBEDDINGS_SERVER_URL: 'https://internal.shinkai.com/x-embed-api',
    UNSTRUCTURED_SERVER_URL: 'https://internal.shinkai.com/x-unstructured-api',
    NO_SECRET_FILE: true,
    NODE_STORAGE_PATH: path.join(__dirname, '../shinkai-node/db'),
    NODE_API_IP: '127.0.0.1',
    NODE_API_PORT: 9550,
  };

  private node: ChildProcess | undefined;
  private nodeExecPath: string;

  constructor(nodeExecPath?: string) {
    this.nodeExecPath =
      nodeExecPath ||
      process.env.SHINKAI_NODE_EXEC_PATH ||
      path.join(__filename, '../../shinkai-node/shinkai_node_macos');
  }

  private resetToPristine(nodeStoragePath: string) {
    fs.rmSync(nodeStoragePath, { recursive: true, force: true });
    if (!fs.existsSync(nodeStoragePath)) {
      fs.mkdirSync(nodeStoragePath);
    }
    fs.copyFileSync(
      path.join(__dirname, '../shinkai-node/.secret'),
      path.join(nodeStoragePath, '.secret'),
    );
  }

  private async spawnNode(
    command: string,
    options: {
      readyMatcher?: RegExp;
      readyMatcherTimeoutMs?: number;
      pipeLogs: boolean;
      logsId?: string;
    },
  ): Promise<ChildProcess> {
    const logsId = options?.logsId || 'unknown';
    const logger = (message: string) => console.log(`${logsId}: ${message}`);
    logger(`executing ${command}`);
    return new Promise((resolve, reject) => {
      const childProcess = spawn(command, {
        detached: false,
        stdio: 'pipe',
        shell: true,
      });
      childProcess.on('close', (err) => {
        logger(`close with code ${String(err)}`);
        reject(err);
      });
      childProcess.on('error', (err) => {
        logger(`error ${String(err)}`);
      });
      childProcess.stderr.on('error', (data) => {
        logger(String(data));
      });
      childProcess.stdout.on('error', (data) => {
        logger(String(data));
      });
      if (options.pipeLogs) {
        childProcess.stderr.on('data', (data) => {
          logger(data.toString());
        });
        childProcess.stdout.on('data', (data) => {
          logger(data.toString());
        });
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
            logger(`process ready, with readyMatcher:${chunk.toString()}`);
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
    const mergedOptions = {
      ...this.defaultNodeOptions,
      ...(nodeOptions || {}),
    };
    if (pristine) {
      this.resetToPristine(mergedOptions.NODE_STORAGE_PATH);
    }
    const nodeEnv = Object.entries(mergedOptions)
      .map(([key, value]) => {
        return `${key}="${value}"`;
      })
      .join(' ');

    this.node = await this.spawnNode(`${nodeEnv} ${this.nodeExecPath}`, {
      pipeLogs: true,
      logsId: 'shinkai-node',
      readyMatcher: /Server::run/,
    });
    console.log('node started');
  }

  async stopNode(): Promise<void> {
    console.log('stopping node');
    if (!this.node) {
      return Promise.resolve();
    }
    this.node.kill();
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.warn('stopping node timeout');
        resolve();
      }, 5000);
      this.node.once('exit', () => {
        console.log('stopping node success');
        clearTimeout(timeout);
        resolve();
      });
    });
    this.node = undefined;
  }
}
