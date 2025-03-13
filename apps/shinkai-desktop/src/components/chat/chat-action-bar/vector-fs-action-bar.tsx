import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { FilesIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Folder } from 'lucide-react';

import { actionButtonClassnames } from '../conversation-footer';

type OpenChatFolderActionBarProps = {
  onClick: () => void;
  disabled?: boolean;
  aiFilesCount?: number;
};

function VectorFsActionBarBase({
  onClick,
  aiFilesCount = 0,
  disabled,
}: OpenChatFolderActionBarProps) {
  const { t } = useTranslation();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              actionButtonClassnames,
              'w-auto gap-2',
              disabled && 'opacity-50',
              aiFilesCount > 0 && 'bg-cyan-950 hover:bg-cyan-950',
            )}
            disabled={disabled}
            onClick={onClick}
            type="button"
          >
            {aiFilesCount > 0 ? (
              <Badge className="bg-official-gray-1000 inline-flex size-4 items-center justify-center rounded-full border-gray-200 p-0 text-center text-[10px] text-gray-50">
                {aiFilesCount}
              </Badge>
            ) : (
              <FilesIcon className="size-4" />
            )}
            Local AI Files
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            Local AI Files
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </>
  );
}
export const VectorFsActionBar = VectorFsActionBarBase;
