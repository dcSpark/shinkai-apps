import { useGetDownloadFile } from '@shinkai_network/shinkai-node-state/v2/queries/getDownloadFile/useGetDownloadFile';
import {
  Badge,
  Button,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@shinkai_network/shinkai-ui';
import { FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
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
              <svg
                className="size-4 text-cyan-400"
                fill={'none'}
                height={24}
                viewBox="0 0 24 24"
                width={24}
              >
                <path
                  d="M19 11.0032V10C19 6.22876 19 4.34315 17.8284 3.17157C16.6569 2 14.7712 2 11 2H10.0082L3 8.98648V14.0062C3 17.7714 3 19.654 4.16811 20.825L4.17504 20.8319C5.34602 22 7.2286 22 10.9938 22"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M3 9.00195H4C6.82843 9.00195 8.24264 9.00195 9.12132 8.12327C10 7.24459 10 5.83038 10 3.00195V2.00195"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M16.4069 21.5983C16.6192 22.1365 17.3808 22.1365 17.5931 21.5983L17.6298 21.5051C18.1482 20.1906 19.1887 19.1502 20.5031 18.6318L20.5964 18.595C21.1345 18.3828 21.1345 17.6211 20.5964 17.4089L20.5031 17.3721C19.1887 16.8537 18.1482 15.8133 17.6298 14.4989L17.5931 14.4056C17.3808 13.8674 16.6192 13.8674 16.4069 14.4056L16.3702 14.4989C15.8518 15.8133 14.8113 16.8537 13.4969 17.3721L13.4036 17.4089C12.8655 17.6211 12.8655 18.3828 13.4036 18.595L13.4969 18.6318C14.8113 19.1502 15.8518 20.1906 16.3702 21.5051L16.4069 21.5983Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
              </svg>
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
