import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Badge,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import {
  FilesIcon,
  WebSearchDisabledIcon,
  WebSearchIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Folder } from 'lucide-react';

import { actionButtonClassnames } from '../conversation-footer';

type OpenChatFolderActionBarProps = {
  onClick: () => void;
  disabled?: boolean;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
};

export function WebSearchActionBar({
  onClick,
  disabled,
  checked,
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
              checked && 'bg-cyan-950 hover:bg-cyan-950',
            )}
            onClick={onClick}
            type="button"
          >
            {checked ? (
              <WebSearchIcon className="size-4" />
            ) : (
              <WebSearchDisabledIcon className="size-4" />
            )}
            <span>Web</span>
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            {checked ? 'Disable' : 'Enable'} Web Search
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </>
  );
}
