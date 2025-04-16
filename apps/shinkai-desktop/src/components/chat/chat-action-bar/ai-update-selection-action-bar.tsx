import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateAgentInJob } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgentInJob/useUpdateAgentInJob';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetProviderFromJob } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob';
import {
  Badge,
  buttonVariants,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { AIAgentIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BoltIcon, BotIcon, ChevronDownIcon, PlusIcon } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import OLLAMA_MODELS_REPOSITORY from '../../../lib/shinkai-node-manager/ollama-models-repository.json';
import { useAuth } from '../../../store/auth';
import { useShinkaiNodeManager } from '../../../store/shinkai-node-manager';
import ProviderIcon from '../../ais/provider-icon';
import { CODE_GENERATOR_MODEL_ID } from '../../tools/constants';
import { actionButtonClassnames } from '../conversation-footer';

const ollamaDescriptionMap = OLLAMA_MODELS_REPOSITORY.reduce(
  (acc, model) => {
    acc[model.name] = model.description;
    return acc;
  },
  {} as Record<string, string>,
);

const nonOllamaProviderModels = {
  'shinkai-backend:free_text_inference':
    'Shinkai AI model for text generation.',
  'shinkai-backend:code_generator':
    'Shinkai AI model for generating tool code.',
  'openai:gpt-4o':
    'Powerful OpenAI model known for its ability to generate human-like text and handle complex tasks.',
  'openai:gpt-4o-mini':
    'Lightweight OpenAI model for concise text and image generation.',
  'openai:gpt-4o-2024-08-06':
    'Latest OpenAI GPT-4 model for diverse and accurate content generation.',
} as Record<string, string>;

export function AIModelSelectorBase({
  value,
  onValueChange,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const auth = useAuth((state) => state.auth);
  const { isSuccess: isLlmProviderSuccess, llmProviders } = useGetLLMProviders(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      enabled: true,
      select: (data) => {
        return data.map((provider) => {
          let description =
            'A versatile AI model for text generation and understanding.';
          if (provider.model.includes('ollama')) {
            const model = provider.model.split(':');
            description = ollamaDescriptionMap[model[1]] || '';
          } else if (provider.model.includes('claude')) {
            description =
              'Safe and thoughtful Anthropic AI model with advanced coding capabilities';
          } else {
            description = nonOllamaProviderModels[provider.model] || '';
          }

          return {
            ...provider,
            description: description,
          };
        });
      },
    },
  );

  const { data: agents, isSuccess: isAgentsSuccess } = useGetAgents({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });
  const isRegularChatPage =
    location.pathname.includes('inboxes') || location.pathname.includes('home');

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const selectedIcon = useMemo(() => {
    const selectedProvider = llmProviders?.find(
      (llmProvider) => llmProvider.id === value,
    );
    if (selectedProvider) {
      return (
        <ProviderIcon
          className="mr-1 size-4"
          provider={selectedProvider.model.split(':')[0]}
        />
      );
    }
    const selectedAgent = agents?.find((agent) => agent.name === value);
    if (selectedAgent) {
      return <AIAgentIcon className="mr-1 size-4" />;
    }
    return <BotIcon className="mr-1 size-4" />;
  }, [agents, llmProviders, value]);

  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );

  return (
    <Dialog onOpenChange={setIsDialogOpen} open={isDialogOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <button
              className={cn(
                actionButtonClassnames,
                'w-auto justify-between truncate',
                className,
              )}
            >
              <div className="flex items-center gap-1.5">
                {selectedIcon}
                <span>{value ?? 'Select'}</span>
              </div>
              <ChevronDownIcon className="icon h-3 w-3" />
            </button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent
            align="center"
            className="flex flex-col gap-1"
            side="top"
          >
            <span className="text-center text-xs text-white">
              {t('llmProviders.switch')}
            </span>
            {isRegularChatPage && (
              <div className="flex items-center gap-4 text-left">
                <div className="text-official-gray-400 flex items-center justify-center gap-2 text-xs">
                  <CommandShortcut>⌘ [</CommandShortcut> or
                  <CommandShortcut>⌘ ]</CommandShortcut>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-official-gray-400 text-xs">
                    Prev / Next AI
                  </span>
                </div>
              </div>
            )}
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
      <DialogContent className="bg-official-gray-950 border-official-gray-780 size-full max-h-[500px] border p-1 py-2">
        <DialogTitle className="sr-only">
          {t('llmProviders.switch')}
        </DialogTitle>
        <Command
          className="[&_[cmdk-input-wrapper]]:border-official-gray-850 h-full [&_[cmdk-input-wrapper]]:pb-1"
          disablePointerSelection
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsDialogOpen(false);
            }
          }}
          onValueChange={onValueChange}
          value={value}
        >
          <CommandInput placeholder="Search..." />
          <CommandEmpty className="text-official-gray-400 py-5 text-center text-sm">
            No results found.
          </CommandEmpty>
          <CommandList className="flex max-h-full flex-col">
            <CommandGroup
              className="py-4"
              heading={
                <div className="flex items-center justify-between gap-2 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="font-clash text-sm font-medium text-white">
                      Agents
                    </h3>
                    <p className="text-official-gray-400 text-xs font-normal">
                      Explore custom AI agents for your needs
                    </p>
                  </div>
                  <Link
                    className={cn(
                      buttonVariants({
                        size: 'xs',
                      }),
                    )}
                    to="/add-agent"
                  >
                    <PlusIcon className="size-4" />
                    Add
                  </Link>
                </div>
              }
            >
              {isAgentsSuccess &&
                agents.map((agent) => (
                  <CommandItem
                    className="hover:bg-official-gray-850 data-[selected='true']:bg-official-gray-850 flex cursor-pointer items-center justify-between gap-1.5 rounded-md px-2 py-2 text-white transition-colors"
                    key={agent.agent_id}
                    onSelect={() => {
                      setIsDialogOpen(false);
                    }}
                    value={agent.agent_id}
                  >
                    <div className="inline-flex gap-2">
                      <div className="bg-official-gray-900 flex size-10 shrink-0 items-center justify-center gap-2 rounded-lg p-2">
                        <AIAgentIcon className="size-5 shrink-0" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="inline-flex items-center gap-1.5 text-sm">
                          {agent.name}
                        </span>
                        <span className="text-official-gray-400 line-clamp-1 text-xs">
                          {agent.ui_description}
                        </span>
                      </div>
                    </div>
                    <Tooltip>
                      <TooltipTrigger
                        asChild
                        className="flex shrink-0 items-center gap-1"
                      >
                        <Link
                          className="text-gray-80 size-3.5 rounded-lg hover:text-white"
                          to={`/agents/edit/${agent.agent_id}`}
                        >
                          <BoltIcon className="size-full" />
                        </Link>
                      </TooltipTrigger>
                      <TooltipPortal>
                        <TooltipContent
                          align="center"
                          alignOffset={-10}
                          className="z-[2000000001] max-w-md"
                          side="top"
                        >
                          <p>Configure Agent</p>
                        </TooltipContent>
                      </TooltipPortal>
                    </Tooltip>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator className="" />
            <CommandGroup
              className="py-4"
              heading={
                <div className="flex items-center justify-between gap-2 pb-2">
                  <div className="space-y-0.5">
                    <h3 className="font-clash text-sm font-medium text-white">
                      AI Models
                    </h3>
                    <p className="text-official-gray-400 text-xs font-normal">
                      Explore a wide range of AI models
                    </p>
                  </div>
                  <Link
                    className={cn(
                      buttonVariants({
                        size: 'xs',
                      }),
                    )}
                    to={
                      isLocalShinkaiNodeIsUse ? '/install-ai-models' : '/add-ai'
                    }
                  >
                    <PlusIcon className="size-4" />
                    Add
                  </Link>
                </div>
              }
            >
              {isLlmProviderSuccess &&
                llmProviders?.length > 0 &&
                llmProviders?.map((llmProvider) => (
                  <CommandItem
                    className="hover:bg-official-gray-850 data-[selected='true']:bg-official-gray-850 flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-white transition-colors"
                    key={llmProvider.id}
                    onSelect={() => {
                      setIsDialogOpen(false);
                    }}
                    value={llmProvider.id}
                  >
                    <div className="bg-official-gray-900 flex size-10 shrink-0 items-center justify-center gap-2 rounded-lg p-2">
                      <ProviderIcon
                        className="mt-0.5 size-4 shrink-0"
                        provider={llmProvider.model.split(':')[0]}
                      />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">
                        {formatText(llmProvider.id)}

                        {location.pathname.includes('tools') &&
                          llmProvider.model.toLowerCase() ===
                            CODE_GENERATOR_MODEL_ID.toLowerCase() && (
                            <Badge
                              className="ml-2 border bg-emerald-900/40 px-1 py-0 text-xs font-medium text-emerald-400"
                              variant="secondary"
                            >
                              Recommended
                            </Badge>
                          )}
                      </span>
                      <span className="text-official-gray-400 line-clamp-2 text-xs">
                        {llmProvider?.description}
                      </span>
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export const AIModelSelector = memo(AIModelSelectorBase);

export function AiUpdateSelectionActionBarBase({
  inboxId,
}: {
  inboxId: string;
}) {
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);

  const { data: provider } = useGetProviderFromJob({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
    jobId: inboxId ? extractJobIdFromInbox(inboxId) : '',
  });

  const { mutateAsync: updateAgentInJob, isPending } = useUpdateAgentInJob({
    onError: (error) => {
      toast.error(t('llmProviders.errors.updateAgent'), {
        description: error.message,
      });
    },
  });

  return (
    <AIModelSelector
      onValueChange={async (value) => {
        if (!provider || isPending) return;
        const jobId = extractJobIdFromInbox(inboxId ?? '');
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
      }}
      value={provider?.agent?.id ?? ''}
    />
  );
}
export const AiUpdateSelectionActionBar = memo(
  AiUpdateSelectionActionBarBase,
  (prevProps, nextProps) => prevProps.inboxId === nextProps.inboxId,
);
