import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils/inbox_name_handler';
import { DEFAULT_CHAT_CONFIG } from '@shinkai_network/shinkai-node-state/v2/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/v2/mutations/createJob/useCreateJob';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { Badge, buttonVariants } from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useSetJobScope } from '../../components/chat/context/set-job-scope-context';
import ConversationFooter from '../../components/chat/conversation-footer';
import ConversationHeader from '../../components/chat/conversation-header';
import { usePromptSelectionStore } from '../../components/prompt/context/prompt-selection-context';
import { useWorkflowSelectionStore } from '../../components/workflow/context/workflow-selection-context';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';

const EmptyMessage = () => {
  const auth = useAuth((state) => state.auth);

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });
  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const { t } = useTranslation();

  const resetJobScope = useSetJobScope((state) => state.resetJobScope);
  const setWorkflowSelected = useWorkflowSelectionStore(
    (state) => state.setWorkflowSelected,
  );
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
    setWorkflowSelected(undefined);
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
      },
    });
  };

  return (
    <div className="flex max-h-screen flex-1 flex-col overflow-hidden pt-2">
      <ConversationHeader />
      <div className="flex w-full flex-1 items-center justify-center p-6">
        <motion.div
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-6 pt-10 text-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div>
            <span aria-hidden={true} className="mb-4 text-4xl">
              🤖
            </span>

            <h1 className="mb-2 text-3xl font-bold text-white">
              {t('chat.emptyStateTitle')}
            </h1>
            <p className="text-gray-80 text-sm">
              {t('chat.emptyStateDescription')}
            </p>
          </div>
          <div className="flex max-w-3xl items-center gap-3">
            {[
              {
                text: 'Explain the fundamentals of AI',
                prompt: 'Explain the fundamentals of AI',
              },
              {
                text: 'Brainstorm for my next vacation',
                prompt: 'Brainstorm ideas for my next vacation',
              },
              {
                text: 'Make a plan meals for the week',
                prompt: 'Make a plan meals for the week',
              },
            ].map((suggestion) => (
              <Badge
                className="cursor-pointer justify-center text-balance bg-gray-300 py-2 font-normal normal-case text-gray-50 transition-colors hover:bg-gray-200"
                key={suggestion.text}
                onClick={() => onCreateJob(suggestion.prompt)}
                variant="outline"
              >
                {suggestion.text}
                <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
              </Badge>
            ))}
          </div>

          <div className="mt-4">
            {llmProviders.length === 0 ? (
              <Link
                className={buttonVariants({
                  variant: 'default',
                })}
                to={isLocalShinkaiNodeIsUse ? '/agents-locally' : '/add-agent'}
              >
                <span>{t('llmProviders.add')}</span>
              </Link>
            ) : null}
          </div>
        </motion.div>
      </div>
      <ConversationFooter />
    </div>
  );
};
export default EmptyMessage;
