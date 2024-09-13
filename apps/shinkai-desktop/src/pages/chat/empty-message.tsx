import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { buttonVariants } from '@shinkai_network/shinkai-ui';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import ConversationFooter from '../../components/chat/conversation-footer';
import { useAuth } from '../../store/auth';
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

  return (
    <div className="flex max-h-screen flex-1 flex-col overflow-hidden pt-2">
      <div className="flex w-full flex-1 items-center justify-center p-6">
        <motion.div
          animate={{ opacity: 1 }}
          className="flex max-w-lg flex-col items-center gap-4 pt-10 text-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span aria-hidden={true} className="text-4xl">
            🤖
          </span>

          <h1 className="text-3xl font-bold text-white">
            {t('chat.emptyStateTitle')}
          </h1>
          <p className="text-gray-80 text-sm">
            {t('chat.emptyStateDescription')}
          </p>

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
