import { useDownloadVRFile } from '@shinkai_network/shinkai-node-state/lib/mutations/downloadVRFile/useDownloadVRFile';
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
} from '@shinkai_network/shinkai-ui/helpers';
import { dialog,fs } from '@tauri-apps/api';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { partial } from 'filesize';
import { LockIcon } from 'lucide-react';
import React from 'react';

import { useAuth } from '../../../store/auth';
import { useVectorFsStore } from '../context/vector-fs-context';

export const VectorFileDetails = () => {
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const size = partial({ standard: 'jedec' });
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: downloadVRFile } = useDownloadVRFile({
    onSuccess: async (response, variables) => {
      const file = new Blob([response.data], {
        type: 'application/octet-stream',
      });
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      const path = await dialog.save({
        defaultPath: variables.path.split('/').at(-1) + '.vrkai',
      });
      if (!path) return;
      await fs.writeBinaryFile(
        {
          path,
          contents: await fetch(dataUrl).then((response) =>
            response.arrayBuffer(),
          ),
        },
        {
          dir: BaseDirectory.Download,
        },
      );
    },
  });

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
              type={
                selectedFile?.vr_header?.resource_source?.Standard?.FileRef
                  ?.file_type?.Document
              }
            />
          </div>
          <p className="text-lg font-medium text-white">
            {selectedFile?.name}
            <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
              {selectedFile?.vr_header?.resource_source?.Standard?.FileRef
                ?.file_type?.Document ?? '-'}
            </Badge>
          </p>
          <p className="text-gray-100">
            <span className="text-sm">
              {formatDateToUSLocaleString(selectedFile?.created_datetime)}
            </span>{' '}
            -{' '}
            <span className="text-sm">{size(selectedFile?.vr_size ?? 0)}</span>
          </p>
        </div>
        <div className="py-6">
          <h2 className="mb-3 text-left text-lg font-medium  text-white">
            Information
          </h2>
          <div className="divide-y divide-gray-300">
            {[
              { label: 'Created', value: selectedFile?.created_datetime },
              {
                label: 'Modified',
                value: selectedFile?.last_written_datetime,
              },
              {
                label: 'Last Opened',
                value: selectedFile?.last_read_datetime,
              },
            ].map((item) => (
              <div
                className="flex items-center justify-between py-2 font-medium"
                key={item.label}
              >
                <span className="text-sm text-gray-100">{item.label}</span>
                <span className="text-sm text-white">
                  {formatDateToLocaleStringWithTime(item.value)}
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
      <SheetFooter>
        <Button
          onClick={async () => {
            if (!selectedFile || !auth) return;
            await downloadVRFile({
              nodeAddress: auth.node_address,
              shinkaiIdentity: auth?.shinkai_identity,
              profile: auth.profile,
              path: selectedFile.path,
              my_device_encryption_sk: auth.profile_encryption_sk,
              my_device_identity_sk: auth.profile_identity_sk,
              node_encryption_pk: auth.node_encryption_pk,
              profile_encryption_sk: auth.profile_encryption_sk,
              profile_identity_sk: auth.profile_identity_sk,
            });
          }}
          variant="default"
        >
          Download Vector Resource
        </Button>
      </SheetFooter>
    </React.Fragment>
  );
};
