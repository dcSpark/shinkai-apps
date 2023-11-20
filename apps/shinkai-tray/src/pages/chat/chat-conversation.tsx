import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";

import { zodResolver } from "@hookform/resolvers/zod";
import { PaperPlaneIcon } from "@radix-ui/react-icons";
import {
  extractJobIdFromInbox,
  extractReceiverShinkaiName,
  isJobInbox,
  isLocalMessage,
} from "@shinkai_network/shinkai-message-ts/utils";
import { Placeholder } from "@tiptap/extension-placeholder";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { FileCheck2, ImagePlusIcon, Loader, X } from "lucide-react";
import { Markdown } from "tiptap-markdown";
import { z } from "zod";

import { useSendMessageToJob } from "../../api/mutations/sendMessageToJob/useSendMessageToJob";
import { useSendMessageWithFilesToInbox } from "../../api/mutations/sendMesssageWithFilesToInbox/useSendMessageWithFilesToInbox";
import { useSendMessageToInbox } from "../../api/mutations/sendTextMessage/useSendMessageToInbox";
import { useGetChatConversationWithPagination } from "../../api/queries/getChatConversation/useGetChatConversationWithPagination";
import Message from "../../components/chat/message";
import { Button } from "../../components/ui/button";
import DotsLoader from "../../components/ui/dots-loader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "../../components/ui/form";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Skeleton } from "../../components/ui/skeleton";
import { formatDate, groupMessagesByDate } from "../../lib/chat-conversation";
import { cn } from "../../lib/utils";
import { useAuth } from "../../store/auth";
import { isImageOrPdf } from "../create-job";

const chatSchema = z.object({
  message: z.string(),
  file: z.any().optional(),
});

const ChatConversation = () => {
  const { inboxId: encodedInboxId = "" } = useParams();
  const auth = useAuth((state) => state.auth);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const previousChatHeightRef = useRef<number>(0);
  const fromPreviousMessagesRef = useRef<boolean>(false);
  const inboxId = decodeURIComponent(encodedInboxId);

  const chatForm = useForm<z.infer<typeof chatSchema>>({
    resolver: zodResolver(chatSchema),
    defaultValues: {
      message: "",
    },
  });

  const { getRootProps: getRootFileProps, getInputProps: getInputFileProps } =
    useDropzone({
      multiple: false,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0];
        const reader = new FileReader();
        if (isImageOrPdf(file)) {
          reader.addEventListener("abort", () => console.log("file reading was aborted"));
          reader.addEventListener("load", (event: ProgressEvent<FileReader>) => {
            const binaryUrl = event.target?.result;
            const image = new Image();
            image.addEventListener("load", function () {
              const imageInfo = Object.assign(file, {
                preview: URL.createObjectURL(file),
              });
              chatForm.setValue("file", imageInfo, { shouldValidate: true });
            });
            image.src = binaryUrl as string;
          });
          reader.readAsDataURL(file);
        } else {
          chatForm.setValue("file", file, { shouldValidate: true });
        }
      },
    });

  const { file } = chatForm.watch();

  const {
    data,
    fetchPreviousPage,
    hasPreviousPage,
    isPending: isChatConversationLoading,
    isFetchingPreviousPage,
    isSuccess: isChatConversationSuccess,
  } = useGetChatConversationWithPagination({
    inboxId: inboxId as string,
    shinkaiIdentity: auth?.shinkai_identity ?? "",
    profile: auth?.profile ?? "",
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? "",
    my_device_identity_sk: auth?.my_device_identity_sk ?? "",
    node_encryption_pk: auth?.node_encryption_pk ?? "",
    profile_encryption_sk: auth?.profile_encryption_sk ?? "",
    profile_identity_sk: auth?.profile_identity_sk ?? "",
  });

  const { mutateAsync: sendMessageToInbox, isPending: isSendingMessageToInbox } =
    useSendMessageToInbox();
  const { mutateAsync: sendMessageToJob, isPending: isSendingMessageToJob } =
    useSendMessageToJob();
  const {
    mutateAsync: sendTextMessageWithFilesForInbox,
    isPending: isSendingTextMessageWithFilesForInbox,
  } = useSendMessageWithFilesToInbox();

  const onSubmit = async (data: z.infer<typeof chatSchema>) => {
    if (!auth || data.message.trim() === "") return;
    fromPreviousMessagesRef.current = false;
    if (data.file) {
      await sendTextMessageWithFilesForInbox({
        sender: auth.shinkai_identity,
        senderSubidentity: auth.profile,
        receiver: auth.shinkai_identity,
        message: data.message,
        inboxId: inboxId,
        file: file,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
      chatForm.reset();
      return;
    }

    if (isJobInbox(inboxId)) {
      const jobId = extractJobIdFromInbox(inboxId);
      await sendMessageToJob({
        jobId: jobId,
        message: data.message,
        files_inbox: "",
        shinkaiIdentity: auth.shinkai_identity,
        profile: auth.profile,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    } else {
      const sender = `${auth.shinkai_identity}/${auth.profile}/device/${auth.registration_name}`;
      const receiver = extractReceiverShinkaiName(inboxId, sender);
      await sendMessageToInbox({
        sender: auth.shinkai_identity,
        sender_subidentity: `${auth.profile}/device/${auth.registration_name}`,
        receiver,
        message: data.message,
        inboxId: inboxId,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    }
    chatForm.reset();
  };

  const isLoading = useMemo(() => {
    if (
      isSendingMessageToJob ||
      isSendingMessageToInbox ||
      isSendingTextMessageWithFilesForInbox
    )
      return true;

    const lastMessage = data?.pages?.at(-1)?.at(-1);

    if (!lastMessage) return false;
    const isLocal = isLocalMessage(
      lastMessage,
      auth?.shinkai_identity ?? "",
      auth?.profile ?? ""
    );

    if (isJobInbox(inboxId) && isLocal) return true;

    return false;
  }, [
    isSendingMessageToJob,
    isSendingMessageToInbox,
    isSendingTextMessageWithFilesForInbox,
    data?.pages,
    auth?.shinkai_identity,
    auth?.profile,
    inboxId,
  ]);

  const fetchPreviousMessages = useCallback(async () => {
    fromPreviousMessagesRef.current = true;
    await fetchPreviousPage();
  }, [fetchPreviousPage]);

  const handleScroll = useCallback(async () => {
    const chatContainerElement = chatContainerRef.current;
    if (!chatContainerElement) return;
    const currentHeight = chatContainerElement.scrollHeight;
    const previousHeight = previousChatHeightRef.current;

    if (chatContainerElement.scrollTop < 100 && hasPreviousPage) {
      await fetchPreviousMessages();
      previousChatHeightRef.current = currentHeight;
      chatContainerElement.scrollTop = currentHeight - previousHeight;
    }
  }, [fetchPreviousMessages, hasPreviousPage]);

  useEffect(() => {
    const chatContainerElement = chatContainerRef.current;
    if (!chatContainerElement) return;
    chatContainerElement.addEventListener("scroll", handleScroll);
    return () => {
      chatContainerElement.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const scrollToBottom = () => {
    if (!chatContainerRef.current) return;
    chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
  };
  useEffect(() => {
    if (!fromPreviousMessagesRef.current) {
      scrollToBottom();
    }
  }, [data?.pages]);

  useEffect(() => {
    scrollToBottom();
  }, [isChatConversationSuccess]);

  useEffect(() => {
    chatForm.reset();
  }, [chatForm, inboxId]);

  return (
    <div className="flex flex-1 flex-col pt-2">
      <ScrollArea className="h-full px-5" ref={chatContainerRef}>
        {isChatConversationSuccess && (
          <div className="py-2 text-center text-xs">
            {isFetchingPreviousPage ? (
              <Loader className="flex animate-spin justify-center text-white" />
            ) : (
              "All messages has been loaded ✅"
            )}
          </div>
        )}
        <div className="pb-4">
          {isChatConversationLoading &&
            [1, 2, 3, 4].map((index) => (
              <Skeleton className="h-10 w-full rounded-lg" key={index} />
            ))}
          {isChatConversationSuccess &&
            data?.pages.map((group, index) => (
              <Fragment key={index}>
                {Object.entries(groupMessagesByDate(group)).map(([date, messages]) => {
                  return (
                    <div key={date}>
                      <div
                        className={cn(
                          "relative z-10 m-auto flex w-[140px] items-center justify-center rounded-xl border border-slate-800 bg-[#131B23] transition-opacity",
                          true && "sticky top-5"
                        )}
                      >
                        <span className="px-2.5 py-2 text-xs capitalize text-foreground">
                          {formatDate(new Date(date))}
                        </span>
                      </div>
                      <div className="flex flex-col gap-4">
                        {messages.map((message) => {
                          return (
                            <Message
                              inboxId={inboxId}
                              key={message.external_metadata?.scheduled_time}
                              message={message}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </Fragment>
            ))}
        </div>
      </ScrollArea>

      <div className="flex flex-col justify-start">
        <div className="relative flex items-start gap-2 bg-app-gradient p-2 pb-3">
          {isLoading ? (
            <DotsLoader className="absolute left-8 top-10 flex items-center justify-center" />
          ) : null}

          <Form {...chatForm}>
            <div
              {...getRootFileProps({
                className: cn(
                  "dropzone group relative relative flex h-12 w-12 flex-shrink-0 cursor-pointer items-center justify-center rounded border-2 border-dashed border-slate-500 border-slate-500 transition-colors hover:border-white",
                  file && "border-0",
                  isLoading && "hidden"
                ),
              })}
            >
              {!file && (
                <ImagePlusIcon className="stroke-slate-500 transition-colors group-hover:stroke-white" />
              )}
              <input
                {...chatForm.register("file")}
                {...getInputFileProps({
                  onChange: chatForm.register("file").onChange,
                })}
              />
              {file && (
                <>
                  {isImageOrPdf(file) && (
                    <img
                      alt=""
                      className="absolute inset-0 h-full w-full rounded-lg bg-white object-cover"
                      src={file.preview}
                    />
                  )}
                  {!isImageOrPdf(file) && (
                    <div className="flex flex-col items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-muted-foreground " />
                      <span className="line-clamp-2 break-all px-2 text-center text-xs ">
                        {file?.name}
                      </span>
                    </div>
                  )}
                </>
              )}
              {file != null && (
                <button
                  className={cn(
                    "absolute -right-1 -top-1 h-6 w-6 cursor-pointer rounded-full bg-slate-900 p-1 hover:bg-slate-800",
                    file ? "block" : "hidden"
                  )}
                  onClick={(event) => {
                    event.stopPropagation();
                    chatForm.setValue("file", undefined, { shouldValidate: true });
                  }}
                >
                  <X className="h-full w-full text-slate-500" />
                </button>
              )}
            </div>

            <FormField
              render={({ field }) => (
                <FormItem className="flex-1 space-y-0">
                  <FormLabel className="sr-only">Enter message</FormLabel>
                  <FormControl>
                    <MessageEditor
                      disabled={isLoading}
                      onChange={field.onChange}
                      onSubmit={chatForm.handleSubmit(onSubmit)}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
              control={chatForm.control}
              name="message"
            />

            <Button
              disabled={isLoading}
              isLoading={isLoading}
              onClick={chatForm.handleSubmit(onSubmit)}
              size="icon"
            >
              <PaperPlaneIcon />
              <span className="sr-only">Send Message</span>
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default ChatConversation;

const MessageEditor = ({
  value,
  onChange,
  onSubmit,
  setInitialValue,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  setInitialValue?: string;
  disabled?: boolean;
}) => {
  // onSubmitRef is used to keep the latest onSubmit function
  const onSubmitRef = useRef(onSubmit);
  useLayoutEffect(() => {
    onSubmitRef.current = onSubmit;
  });

  const editor = useEditor(
    {
      editorProps: {
        attributes: {
          class: "prose prose-invert prose-sm mx-auto focus:outline-none",
        },
      },
      extensions: [
        StarterKit,
        Placeholder.configure({
          placeholder: "Enter message",
        }),
        Markdown,
        Extension.create({
          addKeyboardShortcuts() {
            return {
              Enter: () => {
                onSubmitRef?.current?.();
                return this.editor.commands.clearContent();
              },
              "Shift-Enter": ({ editor }) =>
                editor.commands.first(({ commands }) => [
                  () => commands.newlineInCode(),
                  () => commands.splitListItem("listItem"),
                  () => commands.createParagraphNear(),
                  () => commands.liftEmptyBlock(),
                  () => commands.splitBlock(),
                ]),
            };
          },
        }),
      ],
      content: value,
      autofocus: true,
      onUpdate({ editor }) {
        onChange(editor.storage.markdown.getMarkdown());
      },
      editable: !disabled,
    },
    [disabled]
  );

  useEffect(() => {
    setInitialValue === undefined
      ? editor?.commands.setContent("")
      : editor?.commands.setContent(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setInitialValue]);

  useEffect(() => {
    if (value === "") editor?.commands.setContent("");
  }, [value, editor]);

  return <EditorContent editor={editor} />;
};
