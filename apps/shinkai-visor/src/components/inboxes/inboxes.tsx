import './inboxes.css';

import { isJobInbox } from '@shinkai_network/shinkai-message-ts/utils';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { Bot, MessageCircleIcon, Workflow } from 'lucide-react';
import { Fragment } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import logo from '../../../src/assets/icons/shinkai-min.svg';
import { srcUrlResolver } from '../../helpers/src-url-resolver';
import { useAuth } from '../../store/auth/auth';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export const Inboxes = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const sender = auth?.shinkai_identity ?? '';
  const { inboxIds } = useGetInboxes({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}/device/${auth?.registration_name}`,
    // Assuming receiver and target_shinkai_name_profile are the same as sender
    receiver: sender,
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const navigateToInbox = (inboxId: string) => {
    history.push(`/inboxes/${encodeURIComponent(inboxId)}`);
  };

  return (
    <div className="h-full flex flex-col space-y-3 justify-between overflow-hidden">
      {!inboxIds?.length ? (
        <div className="grow flex flex-col justify-center">
          <div className="space-y-3 text-center mb-6">
            <div className="grid place-content-center">
              <img
                alt="shinkai logo"
                className="animate-spin-slow h-16 w-h-16"
                data-cy="shinkai-logo"
                src={srcUrlResolver(logo)}
              />
            </div>
            <p className="text-lg font-semibold">
              <FormattedMessage id="ask-to-shinkai-ai" />
            </p>
            <p className="text-sm text-center">
              <FormattedMessage id="ask-to-shinkai-ai-example" />
            </p>
          </div>

          <Button
            className="w-full"
            onClick={() => history.push('/agents/add')}
          >
            <Bot className="w-4 h-4 mr-2" />
            <FormattedMessage id="add-agent" />
          </Button>
        </div>
      ) : (
        <div className="flex flex-col">
          <h1 className="font-semibold mb-2">Inboxes</h1>
          <ScrollArea className="[&>div>div]:!block">
            {inboxIds?.map((inboxId) => (
              <Fragment key={inboxId}>
                <Button
                  className="w-full"
                  onClick={() => navigateToInbox(inboxId)}
                  variant="tertiary"
                >
                  {isJobInbox(decodeURIComponent(inboxId)) ? (
                    <Workflow className="h-4 w-4 shrink-0 mr-2" />
                  ) : (
                    <MessageCircleIcon className="h-4 w-4 shrink-0 mr-2" />
                  )}

                  <span className="w-full truncate">
                    {decodeURIComponent(inboxId)}
                  </span>
                </Button>
              </Fragment>
            ))}
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
