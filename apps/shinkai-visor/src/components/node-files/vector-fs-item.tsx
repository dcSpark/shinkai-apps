import { VRItem } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import { Badge, Checkbox, FileTypeIcon } from '@shinkai_network/shinkai-ui';
import { partial } from 'filesize';
import { ChevronRight } from 'lucide-react';
import React from 'react';

import { formatDateToLocaleString } from '../../helpers/date';

const VectorFsItem = ({
  onClick,
  file,
  selectionMode,
  handleSelectFiles,
  isSelectedFile,
}: {
  onClick: () => void;
  file: VRItem;
  selectionMode: boolean;
  handleSelectFiles: (file: VRItem) => void;
  isSelectedFile: boolean;
}) => {
  const size = partial({ standard: 'jedec' });

  if (selectionMode) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-md py-3.5 hover:bg-gray-400/30">
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
          <div className="flex-1 text-left">
            <div className="text-base font-medium">
              {file.name}
              <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
                {file?.vr_header?.resource_source?.Reference?.FileRef?.file_type
                  ?.Document ?? '-'}
              </Badge>
            </div>
            <p className="text-xs font-medium text-gray-100">
              <span>{formatDateToLocaleString(file.created_datetime)}</span> -{' '}
              <span>{size(file.vr_size)}</span>
            </p>
          </div>
        </label>
      </div>
    );
  }

  return (
    <button
      className="flex items-center justify-between gap-2 py-3.5 hover:bg-gray-400"
      onClick={onClick}
    >
      <FileTypeIcon />
      <div className="flex-1 text-left">
        <div className="text-base font-medium">
          {file.name}
          <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
            {file?.vr_header?.resource_source?.Reference?.FileRef?.file_type
              ?.Document ?? '-'}
          </Badge>
        </div>
        <p className="text-xs font-medium text-gray-100">
          <span>{formatDateToLocaleString(file.created_datetime)}</span> -{' '}
          <span>{size(file.vr_size)}</span>
        </p>
      </div>
      <ChevronRight className="text-gray-100" />
    </button>
  );
};
export default VectorFsItem;
