import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetProviderFromJob } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob';
import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';

const ConversationHeaderWithInboxId = () => {
  const currentInbox = useGetCurrentInbox();
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const { data: provider } = useGetProviderFromJob({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
  });
  const { data: agents } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const isAgentInbox = provider?.provider_type === 'Agent';

  const isChatSidebarCollapsed = useSettings(
    (state) => state.isChatSidebarCollapsed,
  );
  const setChatSidebarCollapsed = useSettings(
    (state) => state.setChatSidebarCollapsed,
  );

  const selectedAgent = agents?.find(
    (agent) => agent.agent_id === provider?.agent?.id,
  );

  console.log('selectedAgent', selectedAgent);

  return (
    <div className="border-official-gray-780 flex h-[58px] items-center justify-between border-b px-4 py-2">
      <div className="flex w-full items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="text-gray-80 flex items-center gap-2"
              onClick={() => setChatSidebarCollapsed(!isChatSidebarCollapsed)}
              size="icon"
              variant="tertiary"
            >
              {isChatSidebarCollapsed ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
              <span className="sr-only">
                {isChatSidebarCollapsed ? 'Open' : 'Close'} Chat Sidebar
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent className="flex flex-col items-center gap-1">
              <p> Toggle Chat Sidebar</p>
              <div className="text-gray-80 flex items-center justify-center gap-2 text-center">
                <span>⌘</span>
                <span>B</span>
              </div>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>

        <div className="inline w-full flex-1 truncate whitespace-nowrap text-sm font-medium capitalize text-white">
          {isAgentInbox ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium capitalize text-white">
                {selectedAgent?.name}
              </span>
              <span className="text-official-gray-400 text-xs">
                {selectedAgent?.ui_description}
              </span>
            </div>
          ) : (
            currentInbox?.custom_name || currentInbox?.inbox_id
          )}
        </div>
      </div>
    </div>
  );
};

const ConversationHeader = () => {
  return <ConversationHeaderWithInboxId />;
};

export default memo(ConversationHeader, () => true);
