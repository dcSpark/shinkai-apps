import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Paperclip } from 'lucide-react';
import * as React from 'react';

import { actionButtonClassnames } from '../conversation-footer';

type FileUploadInputProps = {
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  onClick: () => void;
};

export function FileSelectionActionBar({
  onClick,
  inputProps,
}: FileUploadInputProps) {
  const { t } = useTranslation();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(actionButtonClassnames)}
            onClick={onClick}
            type="button"
          >
            <Paperclip className="h-full w-full" />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent align="center" side="top">
            {t('common.uploadFile')} <br />
            {t('common.uploadAFileDescription')}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <input {...inputProps} />
    </>
  );
}
