import { getShinkaiFileProtocol as getShinkaiFileProtocolApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

import { FileTypeSupported } from '../getChatConversation/types';
import type {
  GetShinkaiFileProtocolInput,
  GetShinkaiFilesProtocolInput,
} from './types';

export const getShinkaiFileProtocol = async ({
  nodeAddress,
  token,
  file,
}: GetShinkaiFileProtocolInput) => {
  const result = await getShinkaiFileProtocolApi(nodeAddress, token, {
    file,
  });
  return result;
};

export const getShinkaiFilesProtocol = async ({
  nodeAddress,
  token,
  files,
}: GetShinkaiFilesProtocolInput) => {
  const results = await Promise.all(
    files.map(async (file) => {
      try {
        const result = await getShinkaiFileProtocolApi(nodeAddress, token, {
          file,
        });
        const fileNameBase = file.split('/')?.at(-1) ?? 'untitled';
        const fileExtension = fileNameBase.split('.')?.at(-1) ?? '';
        const blob = new Blob([result]);

        const fileInfo = {
          id: file,
          name: fileNameBase,
          extension: fileExtension,
          path: file,
          size: blob.size,
          blob,
          type: FileTypeSupported.Unknown,
          mimeType: 'application/octet-stream',
        };

        if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
          return {
            ...fileInfo,
            type: FileTypeSupported.Image,
            mimeType: `image/${fileExtension}`,
            url: URL.createObjectURL(
              new Blob([result], {
                type: `image/${fileExtension}`,
              }),
            ),
          };
        }

        if (file.match(/\.(mp4|webm|mov)$/i)) {
          return {
            ...fileInfo,
            type: FileTypeSupported.Video,
            mimeType: `video/${fileExtension}`,
            url: URL.createObjectURL(
              new Blob([result], {
                type: `video/${fileExtension}`,
              }),
            ),
          };
        }

        if (file.match(/\.(mp3|wav|aac)$/i)) {
          return {
            ...fileInfo,
            type: FileTypeSupported.Audio,
            mimeType: `audio/${fileExtension}`,
            url: URL.createObjectURL(
              new Blob([result], {
                type: `audio/${fileExtension}`,
              }),
            ),
          };
        }

        if (file.match(/\.(md|markdown|txt|log|tsx|json|js|jsx)$/i)) {
          const textContent = await result.text();
          return {
            ...fileInfo,
            type: FileTypeSupported.Text,
            mimeType: 'text/plain',
            content: textContent,
          };
        }

        if (file.match(/\.(htm|html)$/i)) {
          return {
            ...fileInfo,
            type: FileTypeSupported.Html,
            mimeType: 'text/html',
            url: URL.createObjectURL(
              new Blob([result], {
                type: 'text/html',
              }),
            ),
          };
        }

        return {
          ...fileInfo,
          mimeType: 'application/octet-stream',
        };
      } catch (error) {
        console.error(`Failed to fetch preview for ${file}:`, error);
        return {
          id: 'error',
          name: file.split('/').at(-1) ?? 'unknown',
          extension: 'txt',
          path: file,
          size: 0,
          type: FileTypeSupported.Error,
          mimeType: 'text/plain',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }),
  );

  return results;
};
