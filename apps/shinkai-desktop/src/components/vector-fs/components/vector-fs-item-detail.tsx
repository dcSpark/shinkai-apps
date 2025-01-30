import { useGetDownloadFile } from '@shinkai_network/shinkai-node-state/v2/queries/getDownloadFile/useGetDownloadFile';
import {
  Badge,
  Button,
  DialogHeader,
  DialogTitle,
  MarkdownText,
} from '@shinkai_network/shinkai-ui';
import {
  EmbeddingsGeneratedIcon,
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui/assets';
import {
  formatDateToLocaleStringWithTime,
  formatDateToUSLocaleString,
  getFileExt,
} from '@shinkai_network/shinkai-ui/helpers';
import { save } from '@tauri-apps/plugin-dialog';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import * as fs from '@tauri-apps/plugin-fs';
import { partial } from 'filesize';
import { LockIcon } from 'lucide-react';
import React, { useEffect } from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { useVectorFsStore } from '../context/vector-fs-context';

interface FilePreviewProps {
  fileContentBase64: string | null;
  extension?: string;
  fileName?: string;
  onDownload?: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  fileContentBase64,
  extension,
  fileName,
  onDownload,
}) => {
  if (!fileContentBase64) return <div>Loading preview...</div>;

  switch (extension?.toLowerCase()) {
    case 'txt':
    case 'json':
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx': {
      const binaryString = atob(fileContentBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const textContent = new TextDecoder('utf-8').decode(bytes);
      return (
        <pre className="h-full overflow-auto whitespace-pre-wrap break-words bg-gray-600 p-4 font-mono text-sm">
          {textContent}
        </pre>
      );
    }
    case 'md': {
      const binaryString = atob(fileContentBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const textContent = new TextDecoder('utf-8').decode(bytes);
      return (
        <div className="h-full overflow-auto p-4">
          <MarkdownText content={textContent} />
        </div>
      );
    }
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return (
        <div className="flex aspect-square h-full items-center justify-center">
          <img
            alt={fileName}
            className="max-h-full max-w-full object-contain"
            src={`data:image/${extension};base64,${fileContentBase64}`}
          />
        </div>
      );
    default:
      return (
        <div className="flex h-full flex-col items-center justify-center gap-6 text-gray-50">
          <span>Preview not available for this file type</span>
          {onDownload && (
            <Button onClick={onDownload} size="xs" variant="outline">
              Download File
            </Button>
          )}
        </div>
      );
  }
};

export const VectorFileDetails = () => {
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const size = partial({ standard: 'jedec' });
  const auth = useAuth((state) => state.auth);
  const [fileContent, setFileContent] = React.useState<string | null>(null);
  const fileExtension = getFileExt(selectedFile?.name ?? '');

  const { mutateAsync: downloadFile } = useGetDownloadFile({});

  useEffect(() => {
    const fetchFileContent = async () => {
      if (selectedFile && auth) {
        try {
          const fileContentBase64 = await downloadFile({
            nodeAddress: auth.node_address,
            token: auth.api_v2_key,
            path: selectedFile.path,
          });
          setFileContent(fileContentBase64);
        } catch (error) {
          console.error('Error downloading file content:', error);
          toast.error('Failed to load file preview');
        }
      }
    };

    fetchFileContent();
  }, [selectedFile, auth, downloadFile]);

  const handleDownloadFile = async () => {
    if (!selectedFile || !auth) return;
    await downloadFile(
      {
        nodeAddress: auth.node_address,
        path: selectedFile.path,
        token: auth.api_v2_key,
      },
      {
        onSuccess: async (response, variables) => {
          if (!fileExtension) {
            toast.error('File extension not found');
            return;
          }
          try {
            const binaryData = Uint8Array.from(atob(response), (c) =>
              c.charCodeAt(0),
            );

            const savePath = await save({
              defaultPath: `${variables.path.split('/').pop()}.${fileExtension.toLowerCase()}`,
              filters: [
                {
                  name: fileExtension,
                  extensions: [fileExtension.toLowerCase()],
                },
              ],
            });

            if (!savePath) {
              toast.info('File save cancelled');
              return;
            }

            await fs.writeFile(savePath, binaryData, {
              baseDir: BaseDirectory.Download,
            });

            toast.success('File saved successfully');
          } catch (error) {
            console.error('Error saving file:', error);
            toast.error('Failed to save file');
          }
        },
      },
    );
  };

  return (
    <React.Fragment>
      <div className="flex size-full">
        <div className="flex max-w-[80%] flex-1 basis-[80%] flex-col overflow-hidden rounded-l-xl bg-gray-600 p-10 text-white">
          <FilePreview
            extension={fileExtension}
            fileContentBase64={fileContent}
            fileName={selectedFile?.name}
            onDownload={handleDownloadFile}
          />
        </div>
        <div className="flex min-w-[350px] flex-1 shrink-0 flex-col rounded-r-xl border-l border-gray-200 bg-gray-300 p-5 pl-4">
          <DialogHeader>
            <DialogTitle className={'sr-only'}>File Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-left">
            <div>
              <FileTypeIcon
                className="h-10 w-10"
                type={getFileExt(selectedFile?.name ?? '')}
              />
            </div>
            <p className="break-words text-lg font-medium text-white">
              {selectedFile?.name}
              <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
                {getFileExt(selectedFile?.name ?? '') ?? '-'}
              </Badge>
            </p>
            <p className="text-gray-100">
              <span className="text-sm">
                {formatDateToUSLocaleString(
                  new Date(selectedFile?.created_time ?? ''),
                )}
              </span>{' '}
              - <span className="text-sm">{size(selectedFile?.size ?? 0)}</span>
            </p>
            {!!selectedFile?.has_embeddings && (
              <div className="inline-flex items-center gap-1 rounded-lg border-cyan-600 bg-cyan-900/20 px-2 py-1">
                <EmbeddingsGeneratedIcon className="size-4 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">
                  Embeddings Generated
                </span>
              </div>
            )}
          </div>
          <div className="py-6">
            <h2 className="mb-3 text-left text-base font-medium text-white">
              Information
            </h2>
            <div className="divide-y divide-gray-300">
              {[
                { label: 'Created', value: selectedFile?.created_time },
                {
                  label: 'Modified',
                  value: selectedFile?.modified_time,
                },
                {
                  label: 'Last Opened',
                  value: selectedFile?.modified_time,
                },
              ].map((item) => (
                <div
                  className="flex items-center justify-between py-2 text-xs font-medium"
                  key={item.label}
                >
                  <span className="text-sm text-gray-100">{item.label}</span>
                  <span className="text-sm text-white">
                    {formatDateToLocaleStringWithTime(
                      new Date(item.value ?? ''),
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="py-6 text-left">
            <h2 className="mb-3 text-base font-medium text-white">
              Permissions
            </h2>
            <span className="text-sm">
              <LockIcon className="mr-2 inline-block h-4 w-4" />
              You can read and write
            </span>
          </div>
          <Button
            onClick={handleDownloadFile}
            size="xs"
            type="button"
            variant="outline"
          >
            Download File
          </Button>
        </div>
      </div>
    </React.Fragment>
  );
};
