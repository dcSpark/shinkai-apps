import { useTranslation } from '@shinkai_network/shinkai-i18n';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import { buttonVariants } from '@shinkai_network/shinkai-ui';
import { Link } from 'react-router-dom';

import { CREATE_JOB_PATH } from '../../routes/name';
import { useAuth } from '../../store/auth';
import { useShinkaiNodeManager } from '../../store/shinkai-node-manager';

const EmptyMessage = () => {
  const auth = useAuth((state) => state.auth);

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const isLocalShinkaiNodeIsUse = useShinkaiNodeManager(
    (state) => state.isInUse,
  );
  const { t } = useTranslation();

  return (
    <div className="flex w-full items-center justify-center p-6">
      <div className="flex max-w-lg flex-col items-center gap-4 text-center">
        <span aria-hidden={true} className="text-4xl">
          🤖
        </span>

        <h1 className="text-2xl font-bold text-white">
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
          ) : (
            <Link
              className={buttonVariants({
                variant: 'default',
              })}
              to={CREATE_JOB_PATH}
            >
              <span>{t('chat.create')}</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmptyMessage;
