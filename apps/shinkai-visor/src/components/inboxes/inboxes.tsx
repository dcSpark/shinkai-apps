import { ShinkaiMessage } from '@shinkai_network/shinkai-message-ts/models';
import {
  getMessageContent,
  isJobInbox,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import { Button } from '@shinkai_network/shinkai-ui';
import {
  Edit,
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
import { EditInboxNameDialog } from '../edit-inbox-name-dialog/edit-inbox-name-dialog';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { EmptyInboxes } from '../empty-inboxes/empty-inboxes';
import { Header } from '../header/header';
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
  const [isEditInboxNameDialogOpened, setIsEditInboxNameDialogOpened] =
    useState<{ isOpened: boolean; inboxId: string; name: string }>({
      isOpened: false,
      inboxId: '',
      name: '',
    });
  const { inboxes } = useGetInboxes({
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: auth?.profile ?? '',
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
  const navigateToInbox = (inbox: {
    inbox_id: string;
    custom_name: string;
    last_message: ShinkaiMessage;
  }) => {
    history.push(`/inboxes/${encodeURIComponent(inbox.inbox_id)}`, { inbox });
  };
  const onCreateJobClick = () => {
    history.push('/inboxes/create-job');
  };
  const onCreateInboxClick = () => {
    history.push('/inboxes/create-inbox');
  };
  const openEditInboxNameDialog = (inboxId: string, name: string) => {
    setIsEditInboxNameDialogOpened({
      isOpened: true,
      inboxId: decodeURIComponent(inboxId),
      name: name,
    });
  };
  const closeEditInboxNameDialog = () => {
    setIsEditInboxNameDialogOpened({
      isOpened: false,
      inboxId: '',
      name: '',
    });
  };
  const editInboxNameClick = (
    event: React.MouseEvent,
    inboxId: string,
    name: string,
  ) => {
    event.stopPropagation();
    openEditInboxNameDialog(inboxId, name);
  };
  return (
    <div className="flex h-full flex-col justify-between space-y-3 overflow-hidden">
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
          <div className="flex grow flex-col overflow-hidden">
            <ScrollArea className="[&>div>div]:!block">
              {inboxes?.map((inbox) => (
                <Fragment key={inbox.inbox_id}>
                  <Button
                    className="group h-14 w-full"
                    onClick={() => navigateToInbox(inbox)}
                    variant="ghost"
                  >
                    <div className="flex w-full flex-row items-center justify-between space-x-2">
                      {isJobInbox(decodeURIComponent(inbox.inbox_id)) ? (
                        <Workflow className="h-4 w-4 shrink-0" />
                      ) : (
                        <MessageCircleIcon className="h-4 w-4 shrink-0" />
                      )}
                      <div className="flex-auto overflow-hidden">
                        <div className="flex flex-col space-y-1">
                          <span className="truncate text-left">
                            {inbox.custom_name}
                          </span>
                          <div className="text-muted-foreground truncate text-left text-xs">
                            {getMessageContent(inbox.last_message)}
                          </div>
                        </div>
                      </div>
                      <Edit
                        className="hidden h-4 w-4 shrink-0 group-hover:block"
                        onClick={(event) =>
                          editInboxNameClick(
                            event,
                            inbox.inbox_id,
                            inbox.custom_name,
                          )
                        }
                      />
                    </div>
                  </Button>
                </Fragment>
              ))}
            </ScrollArea>
          </div>
          <div className="fixed bottom-4 right-4" ref={dialContainerRef}>
            <DropdownMenu onOpenChange={(isOpen) => setDialOpened(isOpen)}>
              <DropdownMenuTrigger asChild>
                <Button size="icon">
                  <Plus
                    className={cn(
                      'h-4 w-4 transition-transform',
                      dialOpened && 'rotate-45',
                    )}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuPortal container={dialContainerRef.current}>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="h-14 w-[170px] justify-center" onClick={() => onCreateInboxClick()}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>
                      <FormattedMessage id="create-inbox" />
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="h-14 w-[170px] justify-center" onClick={() => onCreateJobClick()}>
                    <Workflow className="mr-2 h-4 w-4" />
                    <span>
                      <FormattedMessage id="create-job" />
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenuPortal>
            </DropdownMenu>
          </div>
          <EditInboxNameDialog
            inboxId={isEditInboxNameDialogOpened.inboxId || ''}
            name={isEditInboxNameDialogOpened.name}
            onCancel={() => closeEditInboxNameDialog()}
            onSaved={() => closeEditInboxNameDialog()}
            open={isEditInboxNameDialogOpened.isOpened}
          ></EditInboxNameDialog>
        </>
      )}
    </div>
  );
};
