import { useAgents } from '@shinkai_network/shinkai-node-state/lib/queries/getAgents/useGetAgents';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import {
  ActiveIcon,
  ArchiveIcon,
  Button,
  ChatBubbleIcon,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  JobBubbleIcon,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Plus } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../../store/auth/auth';
import { EditInboxNameDialog } from '../edit-inbox-name-dialog/edit-inbox-name-dialog';
import { EmptyAgents } from '../empty-agents/empty-agents';
import { EmptyInboxes } from '../empty-inboxes/empty-inboxes';
import { Header } from '../header/header';
import { ActiveInboxItem, ArchiveInboxItem } from './inbox-item';

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
    nodeAddress: auth?.node_address ?? '',
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

  const onCreateJobClick = () => {
    history.push('/inboxes/create-job');
  };
  const onCreateInboxClick = () => {
    history.push('/inboxes/create-inbox');
  };

  // const openEditInboxNameDialog = (inboxId: string, name: string) => {
  //   setIsEditInboxNameDialogOpened({
  //     isOpened: true,
  //     inboxId: decodeURIComponent(inboxId),
  //     name: name,
  //   });
  // };
  const closeEditInboxNameDialog = () => {
    setIsEditInboxNameDialogOpened({
      isOpened: false,
      inboxId: '',
      name: '',
    });
  };
  // const editInboxNameClick = (
  //   event: React.MouseEvent,
  //   inboxId: string,
  //   name: string,
  // ) => {
  //   event.stopPropagation();
  //   openEditInboxNameDialog(inboxId, name);
  // };

  const activesInboxes = useMemo(() => {
    return inboxes?.filter((inbox) => !inbox.is_finished);
  }, [inboxes]);

  const archivesInboxes = useMemo(() => {
    return inboxes?.filter((inbox) => inbox.is_finished);
  }, [inboxes]);

  return (
    <div className="flex h-full flex-col justify-between space-y-3 overflow-hidden">
      <Header title={<FormattedMessage id="inbox.other" />} />
      {!agents?.length ? (
        <EmptyAgents data-testid="empty-agents" />
      ) : !inboxes?.length ? (
        <EmptyInboxes data-testid="empty-inboxes" />
      ) : (
        <>
          <div className="flex grow flex-col overflow-hidden">
            <ScrollArea className="pr-4 [&>div>div]:!block">
              <Tabs defaultValue="actives">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    className="flex items-center gap-1.5"
                    value="actives"
                  >
                    <ActiveIcon className="h-4 w-4" />
                    Actives
                  </TabsTrigger>
                  <TabsTrigger
                    className="flex items-center gap-1.5"
                    value="archives"
                  >
                    <ArchiveIcon className="h-4 w-4" />
                    Archives
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="actives">
                  <div className="space-y-4" data-testid="inboxes-container">
                    {activesInboxes?.length ? (
                      activesInboxes.map((inbox) => (
                        <ActiveInboxItem inbox={inbox} key={inbox.inbox_id} />
                      ))
                    ) : (
                      <p className="py-5 text-center">
                        No actives conversations found.{' '}
                      </p>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="archives">
                  <div className="space-y-4" data-testid="inboxes-container">
                    {archivesInboxes?.length ? (
                      archivesInboxes.map((inbox) => (
                        <ArchiveInboxItem inbox={inbox} key={inbox.inbox_id} />
                      ))
                    ) : (
                      <p className="py-5 text-center">
                        No archived conversations found.{' '}
                      </p>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </ScrollArea>
          </div>
          <div className="fixed bottom-4 right-4" ref={dialContainerRef}>
            {auth?.shinkai_identity.includes('localhost') ? (
              <Button
                className="h-[60px] w-[60px]"
                onClick={() => onCreateJobClick()}
                size="icon"
              >
                <Plus />
              </Button>
            ) : (
              <DropdownMenu onOpenChange={(isOpen) => setDialOpened(isOpen)}>
                <DropdownMenuTrigger asChild>
                  <Button className="h-[60px] w-[60px]" size="icon">
                    <Plus
                      className={cn(
                        'h-7 w-7 transition-transform',
                        dialOpened && 'rotate-45',
                      )}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal container={dialContainerRef.current}>
                  <DropdownMenuContent align="end" className="px-2.5 py-2">
                    <DropdownMenuItem onClick={() => onCreateJobClick()}>
                      <JobBubbleIcon className="mr-2 h-4 w-4" />
                      <span>
                        <FormattedMessage id="create-job" />
                      </span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onCreateInboxClick()}>
                      <ChatBubbleIcon className="mr-2 h-4 w-4" />
                      <span>
                        <FormattedMessage id="create-inbox" />
                      </span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            )}
          </div>
          <EditInboxNameDialog
            inboxId={isEditInboxNameDialogOpened.inboxId || ''}
            name={isEditInboxNameDialogOpened.name}
            onCancel={() => closeEditInboxNameDialog()}
            onSaved={() => closeEditInboxNameDialog()}
            open={isEditInboxNameDialogOpened.isOpened}
          />
        </>
      )}
    </div>
  );
};
