import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useGetAgents } from '@shinkai_network/shinkai-node-state/v2/queries/getAgents/useGetAgents';
import { Badge, Button, buttonVariants } from '@shinkai_network/shinkai-ui';
import { AIAgentIcon, CreateAIIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useSetJobScope } from '../components/chat/context/set-job-scope-context';
import ConversationChatFooter from '../components/chat/conversation-footer';
import { usePromptSelectionStore } from '../components/prompt/context/prompt-selection-context';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';

export const showSpotlightWindow = async () => {
  return invoke('show_spotlight_window_app');
};

const EmptyMessage = () => {
  const auth = useAuth((state) => state.auth);

  const { data: agents } = useGetAgents(
    {
      nodeAddress: auth?.node_address ?? '',
      token: auth?.api_v2_key ?? '',
    },
    {
      select: (data) => data.slice(0, 3),
    },
  );

  const location = useLocation();

  const locationState = location.state as {
    agentName: string;
  };

  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const { t } = useTranslation();

  const resetJobScope = useSetJobScope((state) => state.resetJobScope);
  const setPromptSelected = usePromptSelectionStore(
    (state) => state.setPromptSelected,
  );
  const navigate = useNavigate();
  const defaultAgentId = useSettings((state) => state.defaultAgentId);

  const { mutateAsync: createJob } = useCreateJob({
    onError: (error) => {
      toast.error('Failed to send message', {
        description: error.response?.data?.message ?? error.message,
      });
    },
    onSuccess: async (data) => {
      navigate(
        `/inboxes/${encodeURIComponent(buildInboxIdFromJobId(data.jobId))}`,
      );
    },
  });
  useEffect(() => {
    resetJobScope();
    setPromptSelected(undefined);
  }, []);

  const onCreateJob = async (message: string) => {
    if (!auth) return;
    await createJob({
      nodeAddress: auth.node_address,
      token: auth.api_v2_key,
      llmProvider: defaultAgentId,
      content: message,
      isHidden: false,
      chatConfig: {
        stream: DEFAULT_CHAT_CONFIG.stream,
        custom_prompt: '',
        temperature: DEFAULT_CHAT_CONFIG.temperature,
        top_p: DEFAULT_CHAT_CONFIG.top_p,
        top_k: DEFAULT_CHAT_CONFIG.top_k,
        use_tools: DEFAULT_CHAT_CONFIG.use_tools,
      },
    });
  };

  const selectedAgent = agents?.find(
    (agent) => agent.agent_id === locationState?.agentName,
  );

  return (
    <div
      className="flex size-full items-center justify-center p-6"
      style={{ contain: 'strict' }}
    >
      <motion.div
        animate={{ opacity: 1 }}
        className="flex w-full max-w-4xl flex-col items-stretch gap-28 pt-10 text-center"
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-stretch gap-6">
          {selectedAgent ? (
            <div>
              <p className="font-clash text-2xl font-medium text-white">
                {selectedAgent.name}
              </p>
              <p className="text-official-gray-400 text-sm">
                {selectedAgent.ui_description}
              </p>
            </div>
          ) : (
            <h1 className="font-clash mb-2 text-4xl font-semibold text-white">
              How can I help you today?
            </h1>
          )}
          <ConversationChatFooter inboxId={''} isLoadingMessage={false} />
          <div className="flex flex-wrap justify-center gap-3">
            <Badge
              className="hover:bg-official-gray-900 cursor-pointer justify-between text-balance rounded-full py-2 text-left font-normal normal-case text-gray-50 transition-colors"
              onClick={() => showSpotlightWindow()}
              variant="outline"
            >
              Quick Ask Spotlight
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Badge>
            {[
              {
                text: 'Search in DuckDuckGo',
                prompt: 'Search in DuckDuckGo for: ',
              },
              {
                text: 'Summarize a Youtube video',
                prompt: 'Summarize a Youtube video: ',
              },
            ].map((suggestion) => (
              <Badge
                className="hover:bg-official-gray-900 cursor-pointer justify-between text-balance rounded-full py-2 text-left font-normal normal-case text-gray-50 transition-colors"
                key={suggestion.text}
                onClick={() => {
                  setPromptSelected({
                    name: '',
                    prompt: suggestion.prompt,
                    is_enabled: true,
                    is_favorite: false,
                    is_system: true,
                    version: '1',
                    useTools: true,
                    rowid: 0,
                  });
                  const element = document.querySelector(
                    '#chat-input',
                  ) as HTMLDivElement;
                  if (element) {
                    element?.focus?.();
                  }
                }}
                variant="outline"
              >
                {suggestion.text}
                <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
              </Badge>
            ))}
            <Badge
              className="hover:bg-official-gray-900 cursor-pointer justify-between text-balance rounded-full py-2 text-left font-normal normal-case text-gray-50 transition-colors"
              onClick={() => onCreateJob('Tell me about the Roman Empire')}
              variant="outline"
            >
              Tell me about the Roman Empire
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5 text-left">
              <h1 className="text-base font-medium">Explore AI Agents</h1>
              <p className="text-official-gray-400 text-sm">
                Create and explore custom AI agents with tailored instructions
                and diverse skills.
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                className={cn(
                  buttonVariants({ variant: 'link', size: 'xs' }),
                  'text-official-gray-100 underline',
                )}
                to="/agents"
              >
                View All Agents
              </Link>
              <Link
                className={buttonVariants({ variant: 'outline', size: 'xs' })}
                to="/add-agent"
              >
                Create Agent
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents?.map((agent) => (
              <AgentCard
                agentDescription={agent.ui_description}
                agentId={agent.agent_id}
                agentName={agent.name}
                key={agent.agent_id}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
export default EmptyMessage;

const AgentCard = ({
  agentId,
  agentName,
  agentDescription,
}: {
  agentId: string;
  agentName: string;
  agentDescription: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="border-official-gray-850 bg-official-gray-900 flex flex-col items-center justify-between gap-5 rounded-lg border p-4">
      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg">
            <AIAgentIcon className="size-4" />
          </div>
          <span className="w-full truncate text-start text-sm">
            {agentName}{' '}
          </span>
        </div>
        <p className="text-official-gray-400 line-clamp-2 min-h-6 text-left text-sm">
          {agentDescription ?? 'No description'}
        </p>
      </div>
      <Button
        className="w-full"
        onClick={() => {
          navigate(`/home`, { state: { agentName: agentId } });
        }}
        size="xs"
        variant="outline"
      >
        <CreateAIIcon className="size-4" />
        <span className=""> Chat</span>
      </Button>
    </div>
  );
};
