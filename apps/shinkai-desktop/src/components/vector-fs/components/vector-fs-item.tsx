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
import { CreateAIIcon, FileTypeIcon } from '@shinkai_network/shinkai-ui/assets';
import {
  formatDateToUSLocaleString,
  getFileExt,
} from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { partial } from 'filesize';
import { CopyIcon, FileInputIcon, TrashIcon } from 'lucide-react';
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
        <span className="text-sm font-medium">{file.name}</span>
        {!!file.has_embeddings && (
          <Tooltip>
            <TooltipTrigger>
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
                navigate('/inboxes', {
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
          ].map((option, idx) => (
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
