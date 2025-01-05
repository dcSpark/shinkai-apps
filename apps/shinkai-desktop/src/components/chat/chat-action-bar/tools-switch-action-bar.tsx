import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  Switch,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { UseFormReturn } from 'react-hook-form';

import { actionButtonClassnames } from '../conversation-footer';
import { ChatConfigFormSchemaType } from './chat-config-action-bar';

interface ToolsSwitchActionBarProps {
  form?: UseFormReturn<ChatConfigFormSchemaType>;
}

export default function ToolsSwitchActionBar({ form }: ToolsSwitchActionBarProps) {
  const { t } = useTranslation();

  const handleToggleTools = () => {
    if (!form) return;
    form.setValue('useTools', !form.getValues('useTools'));
  };

  const isEnabled = form?.watch('useTools') ?? false;

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              actionButtonClassnames,
              'flex min-w-[70px] items-center justify-between gap-2 px-2'
            )}
            onClick={handleToggleTools}
            type="button"
          >
            <ToolsIcon className="h-4 w-4" />
            <Switch checked={isEnabled} className="pointer-events-none" />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            AI Actions (Tools) {isEnabled ? '(Enabled)' : '(Disabled)'}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
} 