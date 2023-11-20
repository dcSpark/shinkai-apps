import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Outlet, useMatch } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  getMessageContent,
  isJobInbox,
  isLocalMessage,
} from "@shinkai_network/shinkai-message-ts/utils";
import { Edit3, MessageCircleIcon, Workflow } from "lucide-react";
import { z } from "zod";

import { useUpdateInboxName } from "../../api/mutations/updateInboxName/useUpdateInboxName";
import { useGetInboxes } from "../../api/queries/getInboxes/useGetInboxes";
import { Button } from "../../components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../components/ui/form";
import { Input } from "../../components/ui/input";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Separator } from "../../components/ui/separator";
import { handleSendNotification } from "../../lib/notifications.ts";
import { cn } from "../../lib/utils";
import { useAuth } from "../../store/auth";

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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current?.focus();
    }
  }, []);
  const onSubmit = async (data: z.infer<typeof updateInboxNameSchema>) => {
    if (!auth) return;

    await updateInboxName({
      sender: auth.shinkai_identity,
      senderSubidentity: auth.profile,
      receiver: `${auth.shinkai_identity}`,
      receiverSubidentity: "",
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
            render={({ field }) => (
              <div className="flex h-[46px] items-center  rounded-lg bg-app-gradient">
                <Edit3 className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 transform text-white" />
                <FormItem className="space-y-0 pl-7 text-xs">
                  <FormLabel className="sr-only">Update inbox name</FormLabel>
                  <FormControl>
                    <Input
                      className="border-none pr-16 text-xs caret-white placeholder:text-gray-600 focus-visible:ring-0 focus-visible:ring-white"
                      placeholder={inboxName}
                      {...field}
                      ref={inputRef}
                    />
                  </FormControl>
                </FormItem>
              </div>
            )}
            control={updateInboxNameForm.control}
            name="inboxName"
          />
        </div>

        {inboxNameValue ? (
          <Button
            className="transformtext-xs absolute right-1 top-1/2 h-8 -translate-y-1/2 text-white"
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
        "Go to Shinkai Tray to see the response"
      );
    }
  }, [lastMessageTime, isJobLastMessage, inboxId, previousLastMessageTime, inboxName]);

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
        "group flex h-[46px] w-full items-center gap-2 rounded-lg px-2 py-2 text-muted-foreground hover:bg-slate-800",
        match && "bg-slate-800 text-foreground"
      )}
      key={inboxId}
      to={to}
    >
      {isJobInbox(inboxId) ? (
        <Workflow className="mr-2 h-4 w-4 shrink-0" />
      ) : (
        <MessageCircleIcon className="mr-2 h-4 w-4 shrink-0" />
      )}
      <span className="line-clamp-1 flex-1 break-all text-left text-xs">{inboxName}</span>
      <Button
        className={cn("hidden justify-self-end", match && "flex")}
        onClick={() => setIsEditable(true)}
        size="icon"
        variant="ghost"
      >
        <Edit3 className="h-4 w-4 text-muted-foreground" />
      </Button>
    </Link>
  );
};

const ChatLayout = () => {
  const auth = useAuth((state) => state.auth);

  const { inboxes } = useGetInboxes({
    sender: auth?.shinkai_identity ?? "",
    senderSubidentity: auth?.profile ?? "",
    // Assuming receiver and target_shinkai_name_profile are the same as sender
    receiver: auth?.shinkai_identity ?? "",
    targetShinkaiNameProfile: `${auth?.shinkai_identity}/${auth?.profile}`,
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? "",
    my_device_identity_sk: auth?.my_device_identity_sk ?? "",
    node_encryption_pk: auth?.node_encryption_pk ?? "",
    profile_encryption_sk: auth?.profile_encryption_sk ?? "",
    profile_identity_sk: auth?.profile_identity_sk ?? "",
  });

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
                    inboxName={
                      inbox.custom_name === inbox.inbox_id
                        ? getMessageContent(inbox.last_message)?.slice(0, 40)
                        : inbox.custom_name?.slice(0, 40)
                    }
                    isJobLastMessage={
                      !isLocalMessage(
                        inbox.last_message,
                        auth?.shinkai_identity ?? "",
                        auth?.profile ?? ""
                      )
                    }
                    lastMessageTime={
                      inbox.last_message.external_metadata?.scheduled_time ?? ""
                    }
                    inboxId={inbox.inbox_id}
                    key={inbox.inbox_id}
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
