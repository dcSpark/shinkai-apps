import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { extractJobIdFromInbox } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { useUpdateAgentInJob } from '@shinkai_network/shinkai-node-state/lib/mutations/updateAgentInJob/useUpdateAgentInJob';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetProviderFromJob } from '@shinkai_network/shinkai-node-state/v2/queries/getProviderFromJob/useGetProviderFromJob';
import {
  Badge,
  CommandShortcut,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { AIAgentIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { BoltIcon, BotIcon, ChevronDownIcon } from 'lucide-react';
import { memo, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import OLLAMA_MODELS_REPOSITORY from '../../../lib/shinkai-node-manager/ollama-models-repository.json';
import { useAuth } from '../../../store/auth';
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
    'Shinkai AI model for testing text, images, and content generation.',
  'shinkai-backend:code_generator':
    'Shinkai AI model for generating tool code.',
  'openai:gpt-4o':
    'OpenAI GPT-4 model for high-quality text and image generation.',
  'openai:gpt-4o-mini':
    'Lightweight OpenAI GPT-4 model for concise text and image generation.',
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
          const isOllama = provider.model.includes('ollama');
          let description =
            'A versatile AI model for text generation and understanding.';
          if (isOllama) {
            const model = provider.model.split(':');
            description = ollamaDescriptionMap[model[1]] || '';
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

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger
              className={cn(
                actionButtonClassnames,
                'w-auto justify-between truncate [&[data-state=open]>.icon]:rotate-180',
                className,
              )}
            >
              <div className="flex items-center gap-1.5">
                {selectedIcon}
                <span>{value ?? 'Select'}</span>
              </div>
              <ChevronDownIcon className="icon h-3 w-3" />
            </DropdownMenuTrigger>
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
          <DropdownMenuContent
            align="start"
            className="bg-official-gray-950 border-official-gray-780 max-h-[460px] min-w-[380px] max-w-[500px] overflow-y-auto border p-1 py-2"
            side="top"
          >
            <DropdownMenuRadioGroup onValueChange={onValueChange} value={value}>
              {isAgentsSuccess && agents.length > 0 && (
                <DropdownMenuLabel className="px-2 py-1">
                  Agents
                </DropdownMenuLabel>
              )}
              {isAgentsSuccess &&
                agents.map((agent) => (
                  <DropdownMenuRadioItem
                    className="aria-checked:bg-official-gray-800 flex cursor-pointer items-center justify-between gap-1.5 rounded-md px-2 py-2 text-white transition-colors"
                    key={agent.agent_id}
                    value={agent.agent_id}
                  >
                    <div className="inline-flex gap-2">
                      <AIAgentIcon className="mt-1 size-4 shrink-0" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">{agent.name}</span>
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
                          to={`/agents/edit/${agent.name}`}
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
                  </DropdownMenuRadioItem>
                ))}
              {isAgentsSuccess && agents.length > 0 && (
                <DropdownMenuSeparator className="bg-official-gray-800" />
              )}
              <DropdownMenuLabel className="mt-2 px-2 py-1 pb-2">
                AI Models
              </DropdownMenuLabel>
              {isLlmProviderSuccess &&
                llmProviders?.length > 0 &&
                llmProviders?.map((llmProvider) => (
                  <DropdownMenuRadioItem
                    className="hover:bg-official-gray-850 aria-checked:bg-official-gray-850 flex cursor-pointer items-start gap-2 rounded-md px-2 py-2 text-white transition-colors"
                    key={llmProvider.id}
                    value={llmProvider.id}
                  >
                    <ProviderIcon
                      className="mt-0.5 size-4 shrink-0"
                      provider={llmProvider.model.split(':')[0]}
                    />
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="">
                        {formatText(llmProvider.id)}
                        {location.pathname.includes('tools') &&
                          llmProvider.model.toLowerCase() ===
                            CODE_GENERATOR_MODEL_ID.toLowerCase() && (
                            <Badge
                              className="ml-2 border border-emerald-900 bg-emerald-900/80 py-0 font-normal text-emerald-400 hover:bg-emerald-900/80"
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
                  </DropdownMenuRadioItem>
                ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </Tooltip>
      </TooltipProvider>
    </DropdownMenu>
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
    jobId: extractJobIdFromInbox(inboxId ?? ''),
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
