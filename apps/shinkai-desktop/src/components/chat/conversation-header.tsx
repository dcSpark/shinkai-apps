import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetProviderFromJob } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  buttonVariants,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { AgentIcon, ToolsIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ExternalLinkIcon,
  FileIcon,
  FolderIcon,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { memo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { useGetCurrentInbox } from '../../hooks/use-current-inbox';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import ProviderIcon from '../ais/provider-icon';

const ConversationHeaderWithInboxId = () => {
  const currentInbox = useGetCurrentInbox();
  const { inboxId: encodedInboxId = '' } = useParams();
  const inboxId = decodeURIComponent(encodedInboxId);
  const auth = useAuth((state) => state.auth);

  const { t } = useTranslation();

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

  const { data: llmProvider } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const selectedModel = llmProvider?.find(
    (provider) => provider.id === selectedAgent?.llm_provider_id,
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
          {isAgentInbox && selectedAgent ? (
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium capitalize text-white">
                {selectedAgent?.name}{' '}
              </span>
              <span className="text-official-gray-400 text-xs">
                {selectedAgent?.ui_description || 'No description'}
                <span className="px-2">⋅</span>
                <Sheet>
                  <SheetTrigger asChild>
                    <span className="text-official-gray-400 text-xs hover:cursor-pointer hover:text-white hover:underline">
                      {t('common.viewDetails')}
                    </span>
                  </SheetTrigger>
                  <SheetContent className="pr-1.5" side="right">
                    <SheetHeader className="">
                      <div className="flex items-center gap-4">
                        <AgentIcon className="size-5" />
                        <SheetTitle className="font-clash text-xl font-medium tracking-wide">
                          {selectedAgent.name}
                        </SheetTitle>
                      </div>
                    </SheetHeader>

                    <ScrollArea className="h-[calc(100vh-130px)] pr-3">
                      <div className="py-6">
                        <h3 className="text-official-gray-400 mb-2 flex items-center gap-2 text-sm font-medium">
                          {t('common.about')}
                        </h3>
                        <p className="text-sm leading-relaxed">
                          {selectedAgent.ui_description}
                        </p>

                        <div className="mt-6">
                          <h3 className="text-official-gray-400 mb-2 flex items-center gap-2 text-sm font-medium">
                            AI Model
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="flex size-4 items-center justify-center rounded-lg">
                              <ProviderIcon
                                className="size-full"
                                provider={selectedModel?.id.split(':')[0]}
                              />
                            </div>
                            <p className="text-sm">{selectedModel?.id}</p>
                          </div>
                        </div>

                        <Accordion
                          className="mt-6"
                          defaultValue={['instructions', 'tools', 'knowledge']}
                          type="multiple"
                        >
                          <AccordionItem
                            className="border-b-0"
                            value="instructions"
                          >
                            <AccordionTrigger className="py-3 hover:no-underline">
                              <div className="text-official-gray-200 flex items-center gap-2">
                                {/* <Sparkles className="h-4 w-4" /> */}
                                <span className="text-sm font-medium">
                                  {t('agents.systemInstructions')}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="bg-official-gray-850 rounded-lg border p-4">
                                <p className="whitespace-pre-wrap text-sm">
                                  {selectedAgent.config?.custom_system_prompt ||
                                    'No system instructions found.'}
                                </p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem className="border-b-0" value="tools">
                            <AccordionTrigger className="py-3 hover:no-underline">
                              <div className="text-official-gray-200 flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  Available Tools{' '}
                                  {selectedAgent.tools.length > 0 && (
                                    <span className="text-official-gray-400 text-xs">
                                      ({selectedAgent.tools.length})
                                    </span>
                                  )}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3">
                                {selectedAgent.tools.length === 0 && (
                                  <p className="text-official-gray-400 text-sm">
                                    No tools found.
                                  </p>
                                )}
                                {selectedAgent.tools.map((tool, index) => (
                                  <div
                                    className="bg-official-gray-850 relative flex cursor-default items-center gap-2 rounded-lg border p-2 pr-8 text-sm transition-colors"
                                    key={index}
                                  >
                                    <ToolsIcon className="h-4 w-4" />
                                    <span className="flex-1 truncate">
                                      {formatText(
                                        tool.split(':::')?.at(-1) ?? '',
                                      )}
                                    </span>
                                    <Link
                                      className="text-official-gray-400 absolute right-2 hover:text-white"
                                      to={`/tools/${tool}`}
                                    >
                                      <ExternalLinkIcon className="h-4 w-4" />
                                    </Link>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem
                            className="border-b-0"
                            value="knowledge"
                          >
                            <AccordionTrigger className="py-3 hover:no-underline">
                              <div className="text-official-gray-200 flex items-center gap-2">
                                <span className="text-sm font-medium">
                                  Knowledge Sources{' '}
                                  {(
                                    selectedAgent.scope?.vector_fs_folders ?? []
                                  ).length > 0 ||
                                    ((
                                      selectedAgent.scope?.vector_fs_items ?? []
                                    )?.length > 0 && (
                                      <span className="text-official-gray-400 text-xs">
                                        (
                                        {(
                                          selectedAgent.scope
                                            ?.vector_fs_folders ?? []
                                        ).length +
                                          (
                                            selectedAgent.scope
                                              ?.vector_fs_items ?? []
                                          ).length}
                                        )
                                      </span>
                                    ))}
                                </span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {(selectedAgent.scope?.vector_fs_folders ?? [])
                                  .length === 0 &&
                                  (selectedAgent.scope?.vector_fs_items ?? [])
                                    .length === 0 && (
                                    <p className="text-official-gray-400 text-sm">
                                      No knowledge sources found.
                                    </p>
                                  )}
                                {selectedAgent.scope?.vector_fs_folders?.map(
                                  (item, index) => (
                                    <div
                                      className="bg-official-gray-850 flex items-center justify-start gap-2 rounded-lg border p-2 capitalize"
                                      key={index}
                                    >
                                      <FolderIcon className="h-4 w-4" />
                                      <span className="text-sm">
                                        {item?.split('/').at(-1)}
                                      </span>
                                    </div>
                                  ),
                                )}
                                {selectedAgent.scope?.vector_fs_items?.map(
                                  (item, index) => (
                                    <div
                                      className="bg-official-gray-850 flex items-center justify-start gap-2 rounded-lg border p-2 capitalize"
                                      key={index}
                                    >
                                      <FileIcon className="h-4 w-4" />
                                      <span className="text-sm">
                                        {item?.split('/').at(-1) ?? ''}
                                      </span>
                                    </div>
                                  ),
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </ScrollArea>
                    <SheetFooter>
                      <Link
                        className={cn(
                          buttonVariants({
                            variant: 'outline',
                          }),
                        )}
                        to={`/agents/edit/${selectedAgent.agent_id}`}
                      >
                        Edit Agent
                      </Link>
                    </SheetFooter>
                  </SheetContent>
                </Sheet>
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
