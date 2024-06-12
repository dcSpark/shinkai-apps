import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { VRItem } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import {
  buttonVariants,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@shinkai_network/shinkai-ui';
import { FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatDateToUSLocaleString } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { CopyIcon, FileInputIcon, TrashIcon } from 'lucide-react';
import React from 'react';

import { useVectorFsStore,VectorFSLayout } from './node-file-context';
import { VectorFsItemAction } from './vector-fs-drawer';

export const VectorFsItemInfo = ({
  file,
  createdDatetime,
  fileSize,
}: {
  file: VRItem;
  createdDatetime: string;
  fileSize: string;
}) => {
  const layout = useVectorFsStore((state) => state.layout);

  return (
    <div className="flex-1 truncate text-left">
      <div className="text-sm font-medium">{file.name}</div>
      {layout === VectorFSLayout.List && (
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
  handleSelectFiles,
  isSelectedFile,
}: {
  onClick: () => void;
  file: VRItem;
  handleSelectFiles: (file: VRItem) => void;
  isSelectedFile: boolean;
}) => {
  const layout = useVectorFsStore((state) => state.layout);
  const isVRSelectionActive = useVectorFsStore(
    (state) => state.isVRSelectionActive,
  );
  const setActiveDrawerMenuOption = useVectorFsStore(
    (state) => state.setActiveDrawerMenuOption,
  );
  const setSelectedFile = useVectorFsStore((state) => state.setSelectedFile);
  const size = partial({ standard: 'jedec' });

  const wrapperClassname = cn(
    'flex items-center justify-between gap-3 truncate rounded-lg py-3.5 pr-2 hover:bg-gradient-to-r hover:from-gray-500 hover:to-gray-400',
    layout === VectorFSLayout.Grid && 'bg-gray-400/30 p-2',
  );

  const createdDatetime = formatDateToUSLocaleString(file.created_datetime);
  const fileSize = size(file.vr_size);

  if (isVRSelectionActive) {
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
          <FileTypeIcon
            type={
              file?.vr_header?.resource_source?.Standard?.FileRef?.file_type
                ?.Document
            }
          />

          <VectorFsItemInfo
            createdDatetime={createdDatetime}
            file={file}
            fileSize={fileSize}
          />
        </label>
      </div>
    );
  }

  return (
    <button className={wrapperClassname} onClick={onClick}>
      <FileTypeIcon
        type={
          file?.vr_header?.resource_source?.Standard?.FileRef?.file_type
            ?.Document
        }
      />
      <VectorFsItemInfo
        createdDatetime={createdDatetime}
        file={file}
        fileSize={fileSize}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={cn(
              buttonVariants({
                variant: 'tertiary',
                size: 'icon',
              }),
              'border-0 hover:bg-gray-500/40',
            )}
            onClick={(event) => {
              event.stopPropagation();
            }}
            role="button"
            tabIndex={0}
          >
            <span className="sr-only">More options</span>
            <DotsVerticalIcon className="text-gray-100" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[160px] border bg-gray-500 px-2.5 py-2"
        >
          {[
            {
              name: 'Move',
              icon: <FileInputIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsItemAction.Move);
              },
            },
            {
              name: 'Copy',
              icon: <CopyIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsItemAction.Copy);
              },
            },
            {
              name: 'Delete',
              icon: <TrashIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsItemAction.Delete);
              },
            },
          ].map((option) => (
            <React.Fragment key={option.name}>
              {option.name === 'Delete' && (
                <DropdownMenuSeparator className="bg-gray-300" />
              )}
              <DropdownMenuItem
                key={option.name}
                onClick={(event) => {
                  event.stopPropagation();
                  option.onClick();
                  setSelectedFile(file);
                }}
              >
                {option.icon}
                {option.name}
              </DropdownMenuItem>
            </React.Fragment>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
};
export default VectorFsItem;
