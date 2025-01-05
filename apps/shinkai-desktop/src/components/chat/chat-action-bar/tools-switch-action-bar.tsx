import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateChatConfig } from '@shinkai_network/shinkai-node-state/v2/mutations/updateChatConfig/useUpdateChatConfig';
import { useGetChatConfig } from '@shinkai_network/shinkai-node-state/v2/queries/getChatConfig/useGetChatConfig';
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
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../../store/auth';
import { actionButtonClassnames } from '../conversation-footer';
import { ChatConfigFormSchemaType } from './chat-config-action-bar';

interface ToolsSwitchActionBarProps {
  form?: UseFormReturn<ChatConfigFormSchemaType>;
}

export default function ToolsSwitchActionBar({ form }: ToolsSwitchActionBarProps) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const jobId = inboxId ? extractJobIdFromInbox(inboxId) : undefined;

  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: jobId ?? '',
    },
    { enabled: !!jobId }
  );

  const { mutateAsync: updateChatConfig } = useUpdateChatConfig();

  const handleToggleTools = async () => {
    if (!form) return;
    
    const newValue = !form.getValues('useTools');
    
    // Always update form value first for immediate UI feedback
    form.setValue('useTools', newValue);

    // Only make API call if we have a jobId and chatConfig
    if (jobId && chatConfig) {
      await updateChatConfig({
        nodeAddress: auth?.node_address ?? '',
        token: auth?.api_v2_key ?? '',
        jobId,
        jobConfig: {
          stream: chatConfig.stream,
          custom_prompt: chatConfig.custom_prompt,
          temperature: chatConfig.temperature,
          top_p: chatConfig.top_p,
          top_k: chatConfig.top_k,
          use_tools: newValue,
        },
      });
    }
  };

  // Keep form in sync with server state for existing chats
  useEffect(() => {
    if (jobId && chatConfig && form) {
      form.setValue('useTools', chatConfig.use_tools ?? false);
    }
  }, [jobId, chatConfig, form]);

  const isToolsEnabled = form?.watch('useTools') ?? false;

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
            <Switch checked={isToolsEnabled} className="pointer-events-none" />
          </button>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            AI Actions (Tools) {isToolsEnabled ? '(Enabled)' : '(Disabled)'}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
} 