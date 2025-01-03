import { useGetDownloadFile } from '@shinkai_network/shinkai-node-state/v2/queries/getDownloadFile/useGetDownloadFile';
import {
  Badge,
  Button,
  SheetFooter,
  SheetHeader,
  SheetTitle,
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
import React from 'react';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { useVectorFsStore } from '../context/vector-fs-context';

export const VectorFileDetails = () => {
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const size = partial({ standard: 'jedec' });
  const auth = useAuth((state) => state.auth);

  const fileExtension = getFileExt(selectedFile?.name ?? '');

  const { mutateAsync: downloadFile } = useGetDownloadFile({
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
            { name: fileExtension, extensions: [fileExtension.toLowerCase()] },
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
  });

  // const { mutateAsync: downloadVRFile } = useDownloadVRFile({
  //   onSuccess: async (response, variables) => {
  //     const file = new Blob([response.data], {
  //       type: 'application/octet-stream',
  //     });
  //     const dataUrl = await new Promise<string>((resolve) => {
  //       const reader = new FileReader();
  //       reader.onload = () => resolve(reader.result as string);
  //       reader.readAsDataURL(file);
  //     });
  //
  //     const path = await save({
  //       defaultPath: variables.path.split('/').at(-1) + '.vrkai',
  //     });
  //     if (!path) return;
  //     const fileContent = await fetch(dataUrl).then((response) =>
  //       response.arrayBuffer(),
  //     );
  //     await fs.writeFile(path, new Uint8Array(fileContent), {
  //       baseDir: BaseDirectory.Download,
  //     });
  //   },
  // });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className={'sr-only'}>Information</SheetTitle>
      </SheetHeader>
      <div>
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
          <h2 className="mb-3 text-left text-lg font-medium text-white">
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
                className="flex items-center justify-between py-2 font-medium"
                key={item.label}
              >
                <span className="text-sm text-gray-100">{item.label}</span>
                <span className="text-sm text-white">
                  {formatDateToLocaleStringWithTime(new Date(item.value ?? ''))}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="py-6 text-left">
          <h2 className="mb-3 text-lg font-medium text-white">Permissions</h2>
          <span className="text-sm">
            <LockIcon className="mr-2 inline-block h-4 w-4" />
            You can read and write
          </span>
        </div>
      </div>
      <SheetFooter className="flex flex-row gap-3 [&>*]:flex-1">
        {/* Hide it til we support it in the node */}
        {/*<Button*/}
        {/*  onClick={async () => {*/}
        {/*    if (!selectedFile || !auth) return;*/}
        {/*    await downloadVRFile({*/}
        {/*      nodeAddress: auth.node_address,*/}
        {/*      shinkaiIdentity: auth?.shinkai_identity,*/}
        {/*      profile: auth.profile,*/}
        {/*      path: selectedFile.path,*/}
        {/*      my_device_encryption_sk: auth.profile_encryption_sk,*/}
        {/*      my_device_identity_sk: auth.profile_identity_sk,*/}
        {/*      node_encryption_pk: auth.node_encryption_pk,*/}
        {/*      profile_encryption_sk: auth.profile_encryption_sk,*/}
        {/*      profile_identity_sk: auth.profile_identity_sk,*/}
        {/*    });*/}
        {/*  }}*/}
        {/*  size="sm"*/}
        {/*  variant="outline"*/}
        {/*>*/}
        {/*  Download Vector Resource*/}
        {/*</Button>*/}
        <Button
          onClick={async () => {
            if (!selectedFile || !auth) return;
            await downloadFile({
              nodeAddress: auth.node_address,
              path: selectedFile.path,
              token: auth.api_v2_key,
            });
          }}
          size="sm"
          variant="default"
        >
          Download Source File
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};
