import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { Badge, buttonVariants } from '@shinkai_network/shinkai-ui';
import { invoke } from '@tauri-apps/api/core';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useSetJobScope } from '../../components/chat/context/set-job-scope-context';
import ConversationFooter from '../../components/chat/conversation-footer';
import ConversationHeader from '../../components/chat/conversation-header';
import { usePromptSelectionStore } from '../../components/prompt/context/prompt-selection-context';
import { useWorkflowSelectionStore } from '../../components/workflow/context/workflow-selection-context';
import { useAuth } from '../../store/auth';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';

export const showSpotlightWindow = async () => {
  return invoke('show_spotlight_window_app');
};

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

  useEffect(() => {
    resetJobScope();
    setWorkflowSelected(undefined);
    setPromptSelected(undefined);
  }, []);

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
          <div className="grid max-w-4xl grid-cols-2 items-center gap-3">
            <Badge
              className="cursor-pointer justify-between text-balance bg-gray-300 py-2 text-left font-normal normal-case text-gray-50 transition-colors hover:bg-gray-200"
              onClick={() => showSpotlightWindow()}
              variant="outline"
            >
              Quick Ask Spotlight
              <ArrowUpRight className="ml-2 h-3.5 w-3.5" />
            </Badge>
            {[
              {
                text: 'Search in Perplexity',
                prompt: 'Search in Perplexity for: ',
                isToolNeeded: true,
              },
              {
                text: 'Summarize a Youtube video',
                prompt: 'Summarize a Youtube video: ',
                isToolNeeded: true,
              },
              {
                text: 'Tell me about the Roman Empire',
                prompt: 'Tell me about the Roman Empire',
              },
            ].map((suggestion) => (
              <Badge
                className="cursor-pointer justify-between bg-gray-300 py-2 text-left font-normal normal-case text-gray-50 transition-colors hover:bg-gray-200"
                key={suggestion.text}
                onClick={() => {
                  setPromptSelected({
                    name: '',
                    prompt: suggestion.prompt,
                    is_enabled: true,
                    is_favorite: false,
                    is_system: true,
                    version: '1',
                    isToolNeeded: suggestion.isToolNeeded,
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
