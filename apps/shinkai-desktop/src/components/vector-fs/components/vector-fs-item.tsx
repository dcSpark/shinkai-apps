import { DotsVerticalIcon } from '@radix-ui/react-icons';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { DirectoryContent } from '@shinkai_network/shinkai-message-ts/api/vector-fs/types';
import {
  buttonVariants,
  Checkbox,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  CreateAIIcon,
  EmbeddingsGeneratedIcon,
  FileTypeIcon,
} from '@shinkai_network/shinkai-ui/assets';
import {
  formatDateToUSLocaleString,
  getFileExt,
} from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { CopyIcon, Edit2Icon, FileInputIcon, TrashIcon } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useVectorFsStore, VectorFSLayout } from '../context/vector-fs-context';
import { VectorFsItemAction } from './vector-fs-drawer';

export const VectorFsItemInfo = ({
  file,
  createdDatetime,
  fileSize,
}: {
  file: DirectoryContent;
  createdDatetime: string;
  fileSize: string;
}) => {
  const layout = useVectorFsStore((state) => state.layout);

  return (
    <div className="flex-1 truncate text-left">
      <div className="flex items-center gap-2">
        <span className="max-w-sm truncate text-sm font-medium">
          {file.name}
        </span>
        {!!file.has_embeddings && (
          <Tooltip>
            <TooltipTrigger className="rounded-lg border-cyan-600 bg-cyan-900/20 p-1">
              <EmbeddingsGeneratedIcon className="size-4 text-cyan-400" />
            </TooltipTrigger>
            <TooltipPortal>
              <TooltipContent side="top">
                <p>Embeddings Generated</p>
              </TooltipContent>
            </TooltipPortal>
          </Tooltip>
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

const VectorFsItem = ({
  onClick,
  file,
  handleSelectFiles,
  isSelectedFile,
}: {
  onClick: () => void;
  file: DirectoryContent;
  handleSelectFiles: (file: DirectoryContent) => void;
  isSelectedFile: boolean;
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const createdDatetime = formatDateToUSLocaleString(
    new Date(file.created_time),
  );
  const fileSize = size(file.size);

  if (isVRSelectionActive) {
    return (
      <div className={wrapperClassname}>
        <Checkbox
          checked={isSelectedFile}
          id={`item-${file.path}`}
          onCheckedChange={() => {
            handleSelectFiles(file);
          }}
        />
        <label
          className="flex flex-1 items-center gap-3"
          htmlFor={`item-${file.path}`}
        >
          <FileTypeIcon type={getFileExt(file.name)} />
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
      <FileTypeIcon type={getFileExt(file.name)} />
      <VectorFsItemInfo
        createdDatetime={createdDatetime}
        file={file}
        fileSize={fileSize}
      />

      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'icon',
                }),
                'border p-2',
              )}
              onClick={(event) => {
                event.stopPropagation();
                navigate('/home', {
                  state: {
                    selectedVRFiles: [file.path],
                  },
                });
              }}
              role="button"
              tabIndex={0}
            >
              <CreateAIIcon className="w-full" />
            </div>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent side="top">
              <p>{t('chat.create')}</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenu modal={false}>
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
            <span className="sr-only">{t('common.moreOptions')}</span>
            <DotsVerticalIcon className="text-gray-100" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[160px] border bg-gray-500 px-2.5 py-2"
        >
          {[
            file.path.includes('.txt') && {
              name: t('vectorFs.actions.edit'),
              icon: <Edit2Icon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsItemAction.Edit);
              },
            },
            {
              name: t('vectorFs.actions.move'),
              icon: <FileInputIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsItemAction.Move);
              },
            },
            {
              name: t('vectorFs.actions.copy'),
              icon: <CopyIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsItemAction.Copy);
              },
            },
            {
              name: t('vectorFs.actions.delete'),
              icon: <TrashIcon className="mr-3 h-4 w-4" />,
              onClick: () => {
                setActiveDrawerMenuOption(VectorFsItemAction.Delete);
              },
            },
          ]
            .filter((item) => !!item)
            .map((option, idx) => (
              <React.Fragment key={option.name}>
                {idx === 2 && <DropdownMenuSeparator className="bg-gray-300" />}
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
