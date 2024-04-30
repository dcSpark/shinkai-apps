import {
  Badge,
  FileTypeIcon,
  // Button,
  // DrawerFooter,
  SheetHeader,
  SheetTitle,
} from '@shinkai_network/shinkai-ui';
import { partial } from 'filesize';
import { LockIcon } from 'lucide-react';
import React from 'react';

import {
  formatDateToLocaleStringWithTime,
  formatDateToUSLocaleString,
} from '../../../helpers/date';
import { useVectorFsStore } from '../context/vector-fs-context';

export const VectorFileDetails = () => {
  const selectedFile = useVectorFsStore((state) => state.selectedFile);
  const size = partial({ standard: 'jedec' });

  return (
    <React.Fragment>
      <SheetHeader>
        <SheetTitle className={'sr-only'}>Information</SheetTitle>
      </SheetHeader>
      <div>
        <div className="space-y-2 text-left">
          <div>
            <FileTypeIcon className="h-10 w-10" />
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
      {/*<DrawerFooter>*/}
      {/*  <Button variant="default">Download Vector Resource</Button>*/}
      {/*</DrawerFooter>*/}
    </React.Fragment>
  );
};
