import { ChildProcess, spawn } from 'child_process';

export class NodeManager {
  private defaultNodeOptions = {
    FIRST_DEVICE_NEEDS_REGISTRATION_CODE: false,
    GLOBAL_IDENTITY_NAME: "@@localhost.shinkai",
    EMBEDDINGS_SERVER_URL: "https://internal.shinkai.com/x-embed-api/embed",
    NO_SECRET_FILE: true
  };

  private node: ChildProcess;

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
        childProcess.stdout?.on('data', (chunk: string) => {
          if (options.readyMatcher?.test(chunk)) {
            clearTimeout(timeoutRef);
            resolve(childProcess);
          }
        });
      }
      resolve(childProcess);
    });
  }

  async startNode(nodeOptions?: object): Promise<void> {
    // /Users/agallardol/Documents/github/shinkai-node/target/debug/shinkai_node
    // FIRST_DEVICE_NEEDS_REGISTRATION_CODE=false GLOBAL_IDENTITY_NAME=@@localhost.shinkai EMBEDDINGS_SERVER_URL="https://internal.shinkai.com/x-embed-api/embed" NO_SECRET_FILE=true ./shinkai_node
    const mergedOptions = { ...this.defaultNodeOptions, ...(nodeOptions || {}) };
    const nodeEnv = Object.entries(mergedOptions).map(([key, value]) => {
      return `${key}="${value}"`;
    }).join(' ');

    this.node = await this.spawnNode(`${nodeEnv} ${this.nodeExecPath}`, {
      pipeLogs: true,
    });
  }

  async stopNode(): Promise<void> {
    this.node.kill();
  }
}
