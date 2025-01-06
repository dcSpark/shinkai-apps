import { zodResolver } from '@hookform/resolvers/zod';
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
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { actionButtonClassnames } from '../conversation-footer';
import {
  chatConfigFormSchema,
  ChatConfigFormSchemaType,
} from './chat-config-action-bar';

interface ToolsSwitchActionBarProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function ToolsSwitchActionBar({
  disabled,
  checked,
  onCheckedChange,
}: ToolsSwitchActionBarProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <label
            className={cn(
              actionButtonClassnames,
              'flex min-w-[74px] items-center justify-between gap-2 px-2',
            )}
          >
            <ToolsIcon className="h-4 w-4" />
            <Switch
              checked={checked}
              disabled={disabled}
              onCheckedChange={onCheckedChange}
            />
            <span>AI Actions</span>
          </label>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent>
            AI Actions (Tools) {checked ? '(Enabled)' : '(Disabled)'}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}

export function UpdateToolsSwitchActionBar() {
  const auth = useAuth((state) => state.auth);
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);

  const chatConfigForm = useForm<ChatConfigFormSchemaType>({
    resolver: zodResolver(chatConfigFormSchema),
  });

  const { data: chatConfig } = useGetChatConfig(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: extractJobIdFromInbox(inboxId),
    },
    { enabled: !!inboxId },
  );

  useEffect(() => {
    if (chatConfig) {
      chatConfigForm.reset({
        stream: chatConfig.stream,
        customPrompt: chatConfig.custom_prompt ?? '',
        temperature: chatConfig.temperature,
        topP: chatConfig.top_p,
        topK: chatConfig.top_k,
        useTools: chatConfig.use_tools,
      });
    }
  }, [chatConfig, chatConfigForm]);

  const { mutateAsync: updateChatConfig, isPending } = useUpdateChatConfig({
    onError: (error) => {
      toast.error('Use tools update failed', {
        description: error.response?.data?.message ?? error.message,
      });
    },
  });

  console.log(chatConfigForm.getValues());

  const handleUpdateTool = async (useTools: boolean) => {
    await updateChatConfig({
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
      jobId: extractJobIdFromInbox(inboxId),
      jobConfig: {
        stream: chatConfigForm.getValues().stream,
        custom_prompt: chatConfigForm.getValues().customPrompt ?? '',
        temperature: chatConfigForm.getValues().temperature,
        top_p: chatConfigForm.getValues().topP,
        top_k: chatConfigForm.getValues().topK,
        use_tools: useTools,
      },
    });
  };

  return (
    <ToolsSwitchActionBar
      checked={chatConfigForm.watch('useTools')}
      disabled={isPending}
      onCheckedChange={handleUpdateTool}
    />
  );
}
