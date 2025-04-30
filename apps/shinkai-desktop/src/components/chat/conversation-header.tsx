import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetProviderFromJob } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
  TooltipChevronDownIcon,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
  Trigger,
} from '@shinkai_network/shinkai-ui';
import { ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { ChevronDownIcon, PanelRightClose, PanelRightOpen } from 'lucide-react';
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
                {selectedAgent?.ui_description ?? 'No description'}
                {(selectedAgent?.tools ?? []).length > 0 && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <span className="text-official-gray-400 inline-flex cursor-pointer items-center gap-1 capitalize hover:text-white">
                        - {selectedAgent?.tools.length} Active{' '}
                        {selectedAgent?.tools.length === 1 ? 'tool' : 'tools'}
                        <ChevronDownIcon className="ml-1 size-4" />
                      </span>
                    </PopoverTrigger>
                    <PopoverContent className="text-xs">
                      <p className="text-official-gray-400 mb-2 font-medium">
                        Active Tools
                      </p>
                      {(selectedAgent?.tools ?? []).map((tool) => (
                        <div className="flex items-center gap-2" key={tool}>
                          <ToolsIcon className="size-4" />
                          <p>{formatText(tool?.split(':').at(-1) ?? '')}</p>
                        </div>
                      ))}
                    </PopoverContent>
                  </Popover>
                )}
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
