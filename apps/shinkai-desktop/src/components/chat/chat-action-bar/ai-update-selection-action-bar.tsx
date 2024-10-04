import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateAgentInJob } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgentInJob/useUpdateAgentInJob';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BotIcon, ChevronDownIcon } from 'lucide-react';
import { toast } from 'sonner';

import { useGetCurrentInbox } from '../../../hooks/use-current-inbox';
import { useAuth } from '../../../store/auth';
import { useSettings } from '../../../store/settings';
import { actionButtonClassnames } from '../conversation-footer';

export function AIModelSelector({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger
              className={cn(
                actionButtonClassnames,
                'w-auto truncate [&[data-state=open]>.icon]:rotate-180',
              )}
            >
              <BotIcon className="mr-1 h-4 w-4" />
              <span>{value ?? 'Select'}</span>
              <ChevronDownIcon className="icon h-3 w-3" />
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent align="center" side="top">
              {t('llmProviders.switch')}
            </TooltipContent>
          </TooltipPortal>
          <DropdownMenuContent
            align="start"
            className="max-h-[300px] min-w-[220px] overflow-y-auto bg-gray-300 p-1 py-2"
            side="top"
          >
            <DropdownMenuRadioGroup onValueChange={onValueChange} value={value}>
              {llmProviders.map((agent) => (
                <DropdownMenuRadioItem
                  className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-2 text-white transition-colors hover:bg-gray-200 aria-checked:bg-gray-200"
                  key={agent.id}
                  value={agent.id}
                >
                  <BotIcon className="h-3.5 w-3.5" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs">{agent.id}</span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </Tooltip>
      </TooltipProvider>
    </DropdownMenu>
  );
}
export function AiUpdateSelectionActionBar() {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const currentInbox = useGetCurrentInbox();
  const setDefaultAgentId = useSettings((state) => state.setDefaultAgentId);

  const { mutateAsync: updateAgentInJob } = useUpdateAgentInJob({
    onError: (error) => {
      toast.error(t('llmProviders.errors.updateAgent'), {
        description: error.message,
      });
    },
  });
  return (
    <AIModelSelector
      onValueChange={async (value) => {
        if (!currentInbox) return;

        const jobId = extractJobIdFromInbox(currentInbox?.inbox_id ?? '');
        await updateAgentInJob({
          nodeAddress: auth?.node_address ?? '',
          shinkaiIdentity: auth?.shinkai_identity ?? '',
          profile: auth?.profile ?? '',
          jobId: jobId,
          newAgentId: value,
          my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
          my_device_identity_sk: auth?.profile_identity_sk ?? '',
          node_encryption_pk: auth?.node_encryption_pk ?? '',
          profile_encryption_sk: auth?.profile_encryption_sk ?? '',
          profile_identity_sk: auth?.profile_identity_sk ?? '',
        });
        setDefaultAgentId(value);
      }}
      value={currentInbox?.agent?.id ?? ''}
    />
  );
}
