import {
  getMessageContent,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import {
  Inbox,
  MessageCircle,
  MessageCircleIcon,
  Plus,
  Workflow,
} from 'lucide-react';
import { Fragment, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { cn } from '../../helpers/cn-utils';
import { useAuth } from '../../store/auth/auth';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { EmptyInboxes } from '../empty-inboxes/empty-inboxes';
import { Header } from '../header/header';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ScrollArea } from '../ui/scroll-area';

export const Inboxes = () => {
  const history = useHistory();
  const auth = useAuth((state) => state.auth);
  const dialContainerRef = useRef<HTMLDivElement>(null);
  const [dialOpened, setDialOpened] = useState<boolean>(false);
  const sender = auth?.shinkai_identity ?? '';
  const { inboxes } = useGetInboxes({
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
  const { agents } = useAgents({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const navigateToInbox = (inboxId: string) => {
    history.push(`/inboxes/${encodeURIComponent(inboxId)}`);
  };
  const onCreateJobClick = () => {
    history.push('/inboxes/create-job');
  };
  const onCreateInboxClick = () => {
    history.push('/inboxes/create-inbox');
  };

  return (
    <div className="h-full flex flex-col space-y-3 justify-between overflow-hidden">
      <Header
        icon={<Inbox />}
        title={<FormattedMessage id="inbox.other"></FormattedMessage>}
      />
      {!agents?.length ? (
        <EmptyAgents></EmptyAgents>
      ) : !inboxes?.length ? (
        <EmptyInboxes></EmptyInboxes>
      ) : (
        <>
          <div className="grow flex flex-col overflow-hidden">
            <ScrollArea className="[&>div>div]:!block">
              {inboxes?.map((inbox) => (
                <Fragment key={inbox.inbox_id}>
                  <Button
                    className="w-full"
                    onClick={() => navigateToInbox(inbox.inbox_id)}
                    variant="tertiary"
                  >
                    {isJobInbox(decodeURIComponent(inbox.inbox_id)) ? (
                      <Workflow className="h-4 w-4 shrink-0 mr-2" />
                    ) : (
                      <MessageCircleIcon className="h-4 w-4 shrink-0 mr-2" />
                    )}

                    <span className="w-full truncate">
                      {inbox.custom_name === inbox.inbox_id
                        ? getMessageContent(inbox.last_message)?.slice(0, 40)
                        : inbox.custom_name}
                    </span>
                  </Button>
                </Fragment>
              ))}
            </ScrollArea>
          </div>
          <div className="fixed right-4 bottom-4" ref={dialContainerRef}>
            <DropdownMenu onOpenChange={(isOpen) => setDialOpened(isOpen)}>
              <DropdownMenuTrigger asChild>
                <Button size="icon">
                  <Plus
                    className={cn(
                      'w-4 h-4 transition-transform',
                      dialOpened && 'rotate-45'
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal container={dialContainerRef.current}>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onCreateInboxClick()}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>
                      <FormattedMessage id="create-inbox" />
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCreateJobClick()}>
                    <Workflow className="mr-2 h-4 w-4" />
                    <span>
                      <FormattedMessage id="create-job" />
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
        </>
      )}
    </div>
  );
};
