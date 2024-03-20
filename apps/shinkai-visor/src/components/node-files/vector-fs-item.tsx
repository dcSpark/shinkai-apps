import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { VRItem } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/types';
import {
  Badge,
  Button,
  Checkbox,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import {
  FolderInputIcon,
  PencilLine,
  Share2Icon,
  TrashIcon,
  XIcon,
} from 'lucide-react';
import React from 'react';

import { formatDateToLocaleString } from '../../helpers/date';
import { useVectorFsStore, VectorFSLayout } from './node-file-context';

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
    <div className="flex-1 text-left">
      <div className="text-sm font-medium">
        {file.name}
        {layout === VectorFSLayout.List && (
          <Badge className="text-gray-80 ml-2 bg-gray-400 text-xs uppercase">
            {file?.vr_header?.resource_source?.Reference?.FileRef?.file_type
              ?.Document ?? '-'}
          </Badge>
        )}
      </div>
      {layout === VectorFSLayout.List && (
        <p className="text-xs font-medium text-gray-100">
          <span>{createdDatetime}</span> - <span>{fileSize}</span>
        </p>
      )}
    </div>
  );
};

enum VectorFsItemAction {
  Rename = 'Rename',
  Move = 'Move',
  Share = 'Share',
  Delete = 'Delete',
}

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
  const [selectedOption, setSelectedOption] =
    React.useState<VectorFsItemAction | null>(null);

  const size = partial({ standard: 'jedec' });

  const wrapperClassname = cn(
    'flex items-center justify-between gap-3 rounded-md py-3.5 hover:bg-gray-400',
    layout === VectorFSLayout.Grid && 'rounded-lg bg-gray-400/30 p-2',
  );

  const createdDatetime = formatDateToLocaleString(file.created_datetime);
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
          <FileTypeIcon />
          <VectorFsItemInfo
            createdDatetime={createdDatetime}
            file={file}
            fileSize={fileSize}
          />
        </label>
      </div>
    );
  }

  const renderDrawerContent = (selectedOption: VectorFsItemAction | null) => {
    switch (selectedOption) {
      case VectorFsItemAction.Rename:
        return (
          <React.Fragment>
            <DrawerHeader>
              <DrawerTitle className="flex flex-col items-start gap-1">
                <FileTypeIcon className="h-10 w-10" />
                Rename File
              </DrawerTitle>
            </DrawerHeader>
            <input
              className="w-full rounded-md border-0 bg-gray-500/30 p-2"
              placeholder="Folder name"
              type="text"
            />
            <DrawerFooter>
              <Button className="mt-4">Rename</Button>
            </DrawerFooter>
          </React.Fragment>
        );
      case VectorFsItemAction.Move:
        return (
          <React.Fragment>
            <DrawerHeader>
              <DrawerTitle className="flex flex-col items-start gap-1">
                <FileTypeIcon className="h-10 w-10" />
                Move File
              </DrawerTitle>
            </DrawerHeader>
            <p className="text-gray-100">
              Select the destination folder to move the folder to.
            </p>
            <DrawerFooter>
              <Button className="mt-4">Move</Button>
            </DrawerFooter>
          </React.Fragment>
        );
      case VectorFsItemAction.Share:
        return (
          <React.Fragment>
            <DrawerHeader>
              <DrawerTitle className="flex flex-col items-start gap-1">
                <FileTypeIcon className="h-10 w-10" />
                Share File
              </DrawerTitle>
            </DrawerHeader>
            <p className="text-gray-100">
              Share this folder with other users or groups.
            </p>
            <DrawerFooter>
              <Button className="mt-4">Share</Button>
            </DrawerFooter>
          </React.Fragment>
        );
      case VectorFsItemAction.Delete:
        return (
          <React.Fragment>
            <DrawerHeader>
              <DrawerTitle className="flex flex-col items-start gap-1">
                <FileTypeIcon className="h-10 w-10" />
                Delete File
              </DrawerTitle>
            </DrawerHeader>
            <p className="text-gray-100">
              Are you sure you want to delete this folder? This action cannot be
              undone.
            </p>
            <DrawerFooter>
              <Button className="mt-4">Delete</Button>
            </DrawerFooter>
          </React.Fragment>
        );
      default:
        return null;
    }
  };

  return (
    <React.Fragment>
      <button className={wrapperClassname} onClick={onClick}>
        <FileTypeIcon />
        <VectorFsItemInfo
          createdDatetime={createdDatetime}
          file={file}
          fileSize={fileSize}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="border-0 hover:bg-gray-500/40"
              onClick={(event) => {
                event.stopPropagation();
              }}
              size="icon"
              variant="tertiary"
            >
              <span className="sr-only">More options</span>
              <DotsVerticalIcon className="text-gray-100" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-[160px] border bg-gray-500 px-2.5 py-2"
          >
            {[
              {
                name: 'Rename',
                icon: <PencilLine className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setSelectedOption(VectorFsItemAction.Rename);
                },
              },
              {
                name: 'Move',
                icon: <FolderInputIcon className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setSelectedOption(VectorFsItemAction.Move);
                },
              },
              {
                name: 'Share',
                icon: <Share2Icon className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setSelectedOption(VectorFsItemAction.Share);
                },
              },
              {
                name: 'Delete',
                icon: <TrashIcon className="mr-3 h-4 w-4" />,
                onClick: () => {
                  setSelectedOption(VectorFsItemAction.Delete);
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
      <Drawer
        onOpenChange={(open) => {
          if (!open) {
            setSelectedOption(null);
          }
        }}
        open={!!selectedOption}
      >
        <DrawerContent>
          <DrawerClose className="absolute right-4 top-5">
            <XIcon className="text-gray-80" />
          </DrawerClose>

          {renderDrawerContent(selectedOption)}
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};
export default VectorFsItem;
