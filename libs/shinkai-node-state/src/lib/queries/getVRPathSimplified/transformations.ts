import { FileInfo } from "./types";

export function transformFileInfo(data: any[]): FileInfo[] {
  return data.map(fileInfo => {
    const pathWithSlash = fileInfo.path.startsWith('/') ? fileInfo.path : `/${fileInfo.path}`;
    const name = pathWithSlash.split('/').pop() || '';
    const hasDot = name.includes('.');
    const extension = fileInfo.is_directory || !hasDot ? null : name.split('.').pop();
    const file_size = fileInfo.is_directory ? null : '0';

    return {
      ...fileInfo,
      name,
      extension,
      file_size,
    };
  });
}