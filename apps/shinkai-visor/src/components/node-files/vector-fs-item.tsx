import { VRItem } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { Badge, Checkbox, FileTypeIcon } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { formatDateToLocaleString } from '../../helpers/date';
import { Layout } from './node-files';

const VectorFsItemInfo = ({
  file,
  layout,
  createdDatetime,
  fileSize,
}: {
  file: VRItem;
  layout: Layout;
  createdDatetime: string;
  fileSize: string;
}) => {
  return (
    <div className="flex-1 text-left">
      <div className="text-sm font-medium">
        {file.name}
        {layout === Layout.List && (
          <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
            {file?.vr_header?.resource_source?.Reference?.FileRef?.file_type
              ?.Document ?? '-'}
          </Badge>
        )}
      </div>
      {layout === Layout.List && (
        <p className="text-xs font-medium text-gray-100">
          <span>{createdDatetime}</span> - <span>{fileSize}</span>
        </p>
      )}
    </div>
  );
};

const VectorFsItem = ({
  onClick,
  file,
  selectionMode,
  handleSelectFiles,
  isSelectedFile,
  layout,
}: {
  onClick: () => void;
  file: VRItem;
  selectionMode: boolean;
  handleSelectFiles: (file: VRItem) => void;
  isSelectedFile: boolean;
  layout: Layout;
}) => {
  const size = partial({ standard: 'jedec' });

  const wrapperClassname = cn(
    'flex items-center justify-between gap-3 rounded-md py-3.5 hover:bg-gray-400',
    layout === Layout.Grid && 'rounded-lg bg-gray-400/30 p-2',
  );

  const createdDatetime = formatDateToLocaleString(file.created_datetime);
  const fileSize = size(file.vr_size);

  if (selectionMode) {
    return (
      <div className={wrapperClassname}>
        <Checkbox
          checked={isSelectedFile}
          id={`item-${file.name}`}
          onCheckedChange={() => {
            handleSelectFiles(file);
          }}
        />
        <label
          className="flex flex-1 items-center gap-3"
          htmlFor={`item-${file.name}`}
        >
          <FileTypeIcon />
          <VectorFsItemInfo
            createdDatetime={createdDatetime}
            file={file}
            fileSize={fileSize}
            layout={layout}
          />
        </label>
      </div>
    );
  }

  return (
    <button className={wrapperClassname} onClick={onClick}>
      <FileTypeIcon />
      <VectorFsItemInfo
        createdDatetime={createdDatetime}
        file={file}
        fileSize={fileSize}
        layout={layout}
      />
    </button>
  );
};
export default VectorFsItem;
