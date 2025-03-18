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
  disabled?: boolean;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  onClick: () => void;
};

function FileSelectionActionBarBase({
  onClick,
  inputProps,
  disabled,
}: FileUploadInputProps) {
  const { t } = useTranslation();

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(actionButtonClassnames)}
            disabled={disabled}
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
      <input {...inputProps} disabled={disabled} />
    </>
  );
}
export const FileSelectionActionBar = React.memo(
  FileSelectionActionBarBase,
  (prevProps, nextProps) => {
    return prevProps.disabled === nextProps.disabled;
  },
);
