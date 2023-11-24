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
      <Header title={<FormattedMessage id="inbox.other"></FormattedMessage>} />
      {!agents?.length ? (
        <EmptyAgents />
      ) : !inboxes?.length ? (
        <EmptyInboxes />
      ) : (
        <>
          <div className="flex grow flex-col overflow-hidden">
            <ScrollArea className="[&>div>div]:!block">
              {inboxes?.map((inbox) => (
                <Fragment key={inbox.inbox_id}>
                  <Button
                    className="group h-14 w-full bg-transparent px-1"
                    onClick={() => navigateToInbox(inbox)}
                    variant="ghost"
                  >
                    <div className="flex w-full flex-row items-center justify-between space-x-2">
                      {isJobInbox(decodeURIComponent(inbox.inbox_id)) ? (
                        <svg
                          className="shrink-0"
                          fill="none"
                          height="28"
                          viewBox="0 0 28 28"
                          width="28"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            clipRule="evenodd"
                            d="M3 8.22502C3 6.26046 4.61043 4.65002 6.575 4.65002H21.425C23.3896 4.65002 25 6.26046 25 8.22502V17.575C25 19.5396 23.3896 21.15 21.425 21.15H15.1L9.6 25.275C8.73501 25.9234 7.4 25.2563 7.4 24.175V21.15H6.575C4.61043 21.15 3 19.5396 3 17.575V8.22502ZM8.17677 14.4716L8.17678 14.4717C8.62644 14.8748 9.1538 15.1818 9.72644 15.3736C10.2991 15.5655 10.9049 15.6382 11.5067 15.5873C12.1085 15.5364 12.6935 15.363 13.2258 15.0777C13.6601 14.845 14.0517 14.5419 14.3852 14.1813C14.5102 14.0462 14.4852 13.8356 14.3412 13.7212L13.0626 12.7058C13.0475 12.6938 13.0335 12.6806 13.0209 12.666C12.8405 12.4556 12.7147 12.2034 12.6556 11.9317C12.5901 11.6308 12.6088 11.3178 12.7096 11.0269C12.8105 10.736 12.9895 10.4786 13.2272 10.2828C13.3786 10.158 13.5501 10.0614 13.7335 9.99653C13.907 9.93516 14.0356 9.76959 14.0097 9.58741L13.8164 8.22646C13.7905 8.04427 13.6213 7.91607 13.4422 7.95816C12.8886 8.08823 12.3706 8.34405 11.9294 8.70753C11.4022 9.14184 11.005 9.71304 10.7813 10.3584C10.5575 11.0038 10.516 11.6983 10.6613 12.3657C10.7122 12.5998 10.7855 12.8274 10.8794 13.0455C10.9829 13.2857 10.8196 13.569 10.5655 13.5072L10.5591 13.5056C10.2411 13.4272 9.94256 13.2847 9.68172 13.0868C9.50959 12.9561 9.35629 12.8032 9.22566 12.6323C9.1139 12.4861 8.91239 12.4278 8.75215 12.5183L7.56668 13.1876C7.40645 13.278 7.34886 13.4821 7.45111 13.6351C7.65707 13.9432 7.90088 14.2243 8.17677 14.4716L8.17677 14.4716ZM20.1211 11.7453L20.1211 11.7453C19.6807 11.332 19.1605 11.0132 18.5923 10.8085C18.0242 10.6037 17.4202 10.5172 16.8174 10.5545C16.2146 10.5917 15.6258 10.7518 15.0872 11.0249C14.6477 11.2477 14.2493 11.542 13.9077 11.8949C13.7797 12.0271 13.7999 12.2382 13.9414 12.3558L15.1968 13.4001C15.2116 13.4125 15.2254 13.426 15.2376 13.441C15.4131 13.6553 15.533 13.9101 15.5859 14.183C15.6445 14.4852 15.6187 14.7977 15.5113 15.0863C15.4039 15.3748 15.2191 15.6281 14.9771 15.8184C14.8228 15.9397 14.6492 16.0325 14.4644 16.0932C14.2895 16.1506 14.1572 16.3132 14.179 16.4959L14.3414 17.8609C14.3631 18.0436 14.5293 18.1756 14.7094 18.1376C15.2658 18.0201 15.7894 17.7761 16.2388 17.4227C16.7757 17.0005 17.1858 16.4384 17.4241 15.7983C17.6624 15.1582 17.7196 14.4648 17.5895 13.7942C17.5439 13.5591 17.4759 13.33 17.3869 13.1099C17.289 12.8675 17.4586 12.5879 17.7112 12.6555L17.7175 12.6572C18.0336 12.7427 18.3289 12.892 18.5852 13.0958C18.7543 13.2303 18.9041 13.3867 19.0308 13.5605C19.1392 13.7092 19.3394 13.7721 19.5016 13.6852L20.702 13.043C20.8642 12.9562 20.9264 12.7534 20.8276 12.5982C20.6287 12.2855 20.3913 11.999 20.1211 11.7454L20.1211 11.7453Z"
                            fill="white"
                            fillRule="evenodd"
                          />
                        </svg>
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
