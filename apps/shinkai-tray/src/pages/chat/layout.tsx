import { zodResolver } from '@hookform/resolvers/zod';
import {
  getMessageContent,
  isJobInbox,
  isLocalMessage,
} from '@shinkai_network/shinkai-message-ts/utils';
import { useUpdateInboxName } from '@shinkai_network/shinkai-node-state/lib/mutations/updateInboxName/useUpdateInboxName';
import { GetInboxesOutput } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/types';
import { useGetInboxes } from '@shinkai_network/shinkai-node-state/lib/queries/getInboxes/useGetInboxes';
import {
  Button,
  ChatBubbleIcon,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Input,
  JobBubbleIcon,
  ScrollArea,
  Separator,
  TextField,
} from '@shinkai_network/shinkai-ui';
import { Query } from '@tanstack/react-query';
import { Edit3, MessageCircleIcon, Workflow } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Outlet, useMatch } from 'react-router-dom';
import { z } from 'zod';

import { handleSendNotification } from '../../lib/notifications';
import { cn } from '../../lib/utils';
import { useAuth } from '../../store/auth';

const updateInboxNameSchema = z.object({
  inboxName: z.string(),
});

const InboxNameInput = ({
  closeEditable,
  inboxId,
  inboxName,
}: {
  closeEditable: () => void;
  inboxId: string;
  inboxName: string;
}) => {
  const auth = useAuth((state) => state.auth);
  const updateInboxNameForm = useForm<z.infer<typeof updateInboxNameSchema>>({
    resolver: zodResolver(updateInboxNameSchema),
  });
  const { inboxName: inboxNameValue } = updateInboxNameForm.watch();
  const { mutateAsync: updateInboxName } = useUpdateInboxName();
  // const inputRef = useRef<HTMLInputElement>(null);
  //
  // useEffect(() => {
  //   if (inputRef.current) {
  //     inputRef.current?.focus();
  //   }
  // }, []);
  const onSubmit = async (data: z.infer<typeof updateInboxNameSchema>) => {
    if (!auth) return;

    await updateInboxName({
      sender: auth.shinkai_identity,
      senderSubidentity: auth.profile,
      receiver: `${auth.shinkai_identity}`,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
      inboxId,
      inboxName: data.inboxName,
    });
    closeEditable();
  };

  return (
    <Form {...updateInboxNameForm}>
      <form
        className="relative flex items-center"
        onSubmit={updateInboxNameForm.handleSubmit(onSubmit)}
      >
        <div className="w-full">
          <FormField
            control={updateInboxNameForm.control}
            name="inboxName"
            render={({ field }) => (
              <div className=" flex h-[46px]  items-center rounded-lg">
                <Edit3 className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-white" />
                <TextField field={field} label="Update inbox name" />
                {/*<FormItem className="space-y-0 pl-7 text-xs">*/}
                {/*  <FormLabel className="sr-only">Update inbox name</FormLabel>*/}
                {/*  <FormControl>*/}
                {/*    <Input*/}
                {/*      className="border-none pr-16 text-xs caret-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-white"*/}
                {/*      placeholder={inboxName}*/}
                {/*      {...field}*/}
                {/*      ref={inputRef}*/}
                {/*    />*/}
                {/*  </FormControl>*/}
                {/*</FormItem>*/}
              </div>
            )}
          />
        </div>

        {inboxNameValue ? (
          <Button
            className="absolute right-1 top-1/2 h-8 -translate-y-1/2 transform text-xs text-white"
            size="sm"
            type="submit"
            variant="default"
          >
            Save
          </Button>
        ) : (
          <Button
            className="absolute right-1 top-1/2 h-8 -translate-y-1/2 transform bg-gray-700 text-xs text-white"
            onClick={closeEditable}
            size="sm"
            variant="ghost"
          >
            Cancel
          </Button>
        )}
      </form>
    </Form>
  );
};

const MessageButton = ({
  to,
  inboxId,
  inboxName,
  lastMessageTime,
  isJobLastMessage,
}: {
  to: string;
  inboxId: string;
  inboxName: string;
  lastMessageTime: string;
  isJobLastMessage: boolean;
}) => {
  const match = useMatch(to);
  const previousDataRef = useRef<string>(lastMessageTime);
  const previousLastMessageTime = previousDataRef.current;

  useEffect(() => {
    if (
      lastMessageTime !== previousLastMessageTime &&
      isJobInbox(inboxId) &&
      isJobLastMessage
    ) {
      handleSendNotification(
        `${inboxName} response received`,
        'Go to Shinkai Tray to see the response',
      );
    }
  }, [
    lastMessageTime,
    isJobLastMessage,
    inboxId,
    previousLastMessageTime,
    inboxName,
  ]);

  const [isEditable, setIsEditable] = useState(false);

  return isEditable ? (
    <InboxNameInput
      closeEditable={() => setIsEditable(false)}
      inboxId={inboxId}
      inboxName={inboxName}
    />
  ) : (
    <Link
      className={cn(
        'text-gray-80 group flex h-[46px] w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-500',
        match && 'bg-gray-400 text-white',
      )}
      key={inboxId}
      to={to}
    >
      {isJobInbox(inboxId) ? (
        <JobBubbleIcon className="mr-2 h-4 w-4 shrink-0" />
      ) : (
        <ChatBubbleIcon className="mr-2 h-4 w-4 shrink-0" />
      )}
      <span className="line-clamp-1 flex-1 break-all text-left text-xs">
        {inboxName}
      </span>
      <Button
        className={cn('hidden justify-self-end', match && 'flex')}
        onClick={() => setIsEditable(true)}
        size="icon"
        variant="ghost"
      >
        <Edit3 className="text-gray-80 h-4 w-4" />
      </Button>
    </Link>
  );
};

const ChatLayout = () => {
  const auth = useAuth((state) => state.auth);

  const { inboxes } = useGetInboxes(
    {
      sender: auth?.shinkai_identity ?? '',
      senderSubidentity: auth?.profile ?? '',
      // Assuming receiver and target_shinkai_name_profile are the same as sender
      receiver: auth?.shinkai_identity ?? '',
      targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
    {
      refetchIntervalInBackground: true,
      refetchInterval: (query: Query<GetInboxesOutput>) => {
        const allInboxesAreCompleted = query.state.data?.every((inbox) => {
          return !isLocalMessage(
            inbox.last_message,
            auth?.shinkai_identity ?? '',
            auth?.profile ?? '',
          );
        });
        return allInboxesAreCompleted ? 0 : 3000;
      },
    },
  );

  return (
    <div className="flex h-full">
      {inboxes.length > 0 ? (
        <>
          <div className="flex max-w-[280px] flex-[280px] shrink-0 flex-col px-2 py-4">
            <h2 className="mb-4 px-2">Recent Conversations</h2>
            <ScrollArea>
              <div className="space-y-1">
                {inboxes.map((inbox) => (
                  <MessageButton
                    inboxId={inbox.inbox_id}
                    inboxName={
                      inbox.custom_name === inbox.inbox_id
                        ? getMessageContent(inbox.last_message)?.slice(0, 40)
                        : inbox.custom_name?.slice(0, 40)
                    }
                    isJobLastMessage={
                      !isLocalMessage(
                        inbox.last_message,
                        auth?.shinkai_identity ?? '',
                        auth?.profile ?? '',
                      )
                    }
                    key={inbox.inbox_id}
                    lastMessageTime={
                      inbox.last_message.external_metadata?.scheduled_time ?? ''
                    }
                    to={`/inboxes/${encodeURIComponent(inbox.inbox_id)}`}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
          <Separator orientation="vertical" />
        </>
      ) : null}
      <Outlet />
    </div>
  );
};

export default ChatLayout;
