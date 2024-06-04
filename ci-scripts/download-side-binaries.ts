import { exec } from 'child_process';
import { createWriteStream } from 'fs';
import path from 'path';
import axios from 'axios';
import { ensureFile } from 'fs-extra';
import { copyFile, cp, readdir, rm } from 'fs/promises';
import * as zl from 'zip-lib';
import { z } from 'zod';

enum Arch {
  x86_64_unknown_linux_gnu = 'x86_64-unknown-linux-gnu',
  aarch64_apple_darwin = 'aarch64-apple-darwin',
  x86_64_pc_windows_msvc = 'x86_64-pc-windows-msvc',
}
const envSchema = z.object({
  ARCH: z.nativeEnum(Arch),
  OLLAMA_VERSION: z.string().min(6),
  SHINKAI_NODE_VERSION: z.string().min(6),
});

type Env = z.infer<typeof envSchema>;

const env: Env = envSchema.parse(process.env);

const addExecPermissions = (path: string) => {
  console.log(`Adding exec permissions (+x) to ${path}`);
  return exec(`chmod +x ${path}`);
};
const downloadFile = async (url: string, path: string): Promise<void> => {
  console.log(`Downloading ${url}`);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    onDownloadProgress: function (progressEvent) {
      if (progressEvent.progress) {
        console.log(`${url} progress: ${progressEvent.progress * 100}%`);
      }
    },
  });
  console.log(`ensuring file ${path}`);
  await ensureFile(path);
  console.log(`creating write stream ${path}`);
  response.data.pipe(
    createWriteStream(path, { encoding: 'binary', flags: 'w' }),
  );
  await new Promise<void>((resolve, reject) => {
    response.data.on('end', () => {
      resolve();
    });
    response.data.on('error', (err: any) => {
      console.error(`Error downloading file: ${url}`, err);
      reject(err);
    });
  });
  console.log(`Download complete: ${url}`);
};

const downloadShinkaiNodeBinary = async (arch: Arch, version: string) => {
  console.log(`Downloading shinkai-node arch:${arch} version:${version}`);
  let downloadUrl = `https://download.shinkai.com/shinkai-node/binaries/${arch}/shinkai-node-${version}`;
  let path = `./apps/shinkai-desktop/src-tauri/bin/shinkai-node-${arch}`;
  if (arch === Arch.x86_64_pc_windows_msvc) {
    downloadUrl += '.exe';
    path += '.exe';
  }
  await downloadFile(downloadUrl, path);
  await addExecPermissions(path);
};

const downloadOllamaAarch64AppleDarwin = async (version: string) => {
  let downloadUrl = `https://github.com/ollama/ollama/releases/download/${version}/ollama-darwin`;
  let path = `./apps/shinkai-desktop/src-tauri/bin/ollama-${Arch.aarch64_apple_darwin}`;
  await downloadFile(downloadUrl, path);
  await addExecPermissions(path);
};

const downloadOllamax8664UnknownLinuxGnu = async (version: string) => {
  let downloadUrl = `https://github.com/ollama/ollama/releases/download/${version}/ollama-linux-amd64`;
  let path = `./apps/shinkai-desktop/src-tauri/bin/ollama-${Arch.x86_64_unknown_linux_gnu}`;
  await downloadFile(downloadUrl, path);
  await addExecPermissions(path);
};

const downloadOllamax8664PcWindowsMsvc = async (version: string) => {
  let downloadUrl = `https://github.com/ollama/ollama/releases/download/${version}/ollama-windows-amd64.zip`;
  let zippedPath = `./ollama-windows-amd64.zip`;
  await downloadFile(downloadUrl, zippedPath);

  let unzippedPath = 'ollama-windows-amd64';
  await zl.extract(zippedPath, unzippedPath);

  let resourcesPath =
    './apps/shinkai-desktop/src-tauri/bin/ollama-windows-resources/';
  const files = await readdir(unzippedPath);
  for (const file of files) {
    if (file !== 'ollama.exe') {
      await cp(path.join(unzippedPath, file), path.join(resourcesPath, file), {
        recursive: true,
      });
    }
  }
  let binaryPath = `./apps/shinkai-desktop/src-tauri/bin/ollama-${Arch.x86_64_pc_windows_msvc}.exe`;
  await copyFile(path.join(unzippedPath, 'ollama.exe'), binaryPath);
  await addExecPermissions(binaryPath);
  await rm(unzippedPath, { recursive: true });
  await rm(zippedPath);
};

const downloadOllama = {
  [Arch.aarch64_apple_darwin]: downloadOllamaAarch64AppleDarwin,
  [Arch.x86_64_unknown_linux_gnu]: downloadOllamax8664UnknownLinuxGnu,
  [Arch.x86_64_pc_windows_msvc]: downloadOllamax8664PcWindowsMsvc,
};

export const main = async () => {
  await downloadShinkaiNodeBinary(env.ARCH, env.SHINKAI_NODE_VERSION);
  await downloadOllama[env.ARCH](env.OLLAMA_VERSION);
};

main().catch(console.error);
