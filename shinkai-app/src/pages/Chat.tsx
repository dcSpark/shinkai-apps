import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useParams } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLastMessagesFromInbox,
  createChatWithMessage,
  sendTextMessageWithInbox,
} from "../api/index";
import { RootState } from "../store";
import { useSetup } from "../hooks/usetSetup";
import {
  extractReceiverShinkaiName,
  getOtherPersonIdentity,
} from "../utils/inbox_name_handler";
import { ShinkaiMessage } from "../models/ShinkaiMessage";
import { calculateMessageHash } from "../utils/shinkai_message_handler";
import Avatar from "../components/ui/Avatar";
import { cn } from "../theme/lib/utils";
import { send } from "ionicons/icons";
import "./Chat.css";
import {
  IonContentCustom,
  IonFooterCustom,
  IonHeaderCustom,
} from "../components/ui/Layout";

const parseDate = (dateString: string) => {
  return new Date(dateString);
};

const Chat: React.FC = () => {
  console.log("Loading Chat.tsx");
  useSetup();

  const dispatch = useDispatch();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetailsState
  );

  const { id } = useParams<{ id: string }>();
  const bottomChatRef = useRef<HTMLDivElement>(null);
  const deserializedId = decodeURIComponent(id).replace(/~/g, ".");
  const [lastKey, setLastKey] = useState<string | undefined>(undefined);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);

  const reduxMessages = useSelector(
    (state: RootState) => state.inboxes[deserializedId]
  );

  const [messages, setMessages] = useState<ShinkaiMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const otherPersonIdentity = getOtherPersonIdentity(
    deserializedId,
    setupDetailsState.shinkai_identity
  );

  useEffect(() => {
    console.log("deserializedId:", deserializedId);
    dispatch(
      getLastMessagesFromInbox(deserializedId, 10, lastKey, setupDetailsState)
    );
  }, [id, dispatch, setupDetailsState]);

  useEffect(() => {
    if (reduxMessages && reduxMessages.length > 0) {
      console.log("Redux Messages:", reduxMessages);
      const lastMessage = reduxMessages[reduxMessages.length - 1];
      console.log("Last Message:", lastMessage);
      const timeKey = lastMessage.external_metadata.scheduled_time;
      const hashKey = calculateMessageHash(lastMessage);
      const lastMessageKey = `${timeKey}:${hashKey}`;
      setLastKey(lastMessageKey);
      setMessages(reduxMessages);

      if (reduxMessages.length - prevMessagesLength < 10) {
        setHasMoreMessages(false);
      }
      setPrevMessagesLength(reduxMessages.length);
    }
  }, [reduxMessages]);

  useEffect(() => {
    // Check if the user is at the bottom of the chat
    const isUserAtBottom =
      bottomChatRef.current &&
      bottomChatRef.current.getBoundingClientRect().bottom <=
        window.innerHeight;

    // If the user is at the bottom, scroll to the bottom
    if (isUserAtBottom) {
      bottomChatRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const sendMessage = () => {
    console.log("Sending message: ", inputMessage);

    // Local Identity
    const { shinkai_identity, profile, registration_name } = setupDetailsState;
    // let sender = shinkai_identity;
    let sender = `${shinkai_identity}/${profile}/device/${registration_name}`;

    console.log("Sender:", sender);

    const receiver = extractReceiverShinkaiName(deserializedId, sender);
    console.log("Receiver:", receiver);

    dispatch(
      sendTextMessageWithInbox(
        sender,
        "",
        receiver,
        inputMessage,
        deserializedId,
        setupDetailsState
      )
    );
    setInputMessage("");
  };

  return (
    <IonPage className="bg-slate-900">
      <IonHeaderCustom>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <div className="flex gap-4 px-4">
          <IonTitle className="w-auto text-accent text-center text-inherit">
            {otherPersonIdentity}
          </IonTitle>
          {/*<Avatar className="shrink-0" />*/}
        </div>
      </IonHeaderCustom>

      <IonContentCustom>
        <div className="py-10 md:rounded-[1.25rem] bg-white dark:bg-slate-800">
          {hasMoreMessages && (
            <IonButton
              onClick={() =>
                dispatch(
                  getLastMessagesFromInbox(
                    deserializedId,
                    10,
                    lastKey,
                    setupDetailsState,
                    true
                  )
                )
              }
            >
              Load More
            </IonButton>
          )}
          <IonList class="ion-list-chat p-0 divide-y divide-slate-200 dark:divide-slate-500/50 md:rounded=[1.25rem]  ">
            {messages &&
              messages
                .slice()
                .reverse()
                .map((message, index) => {
                  const { shinkai_identity, profile, registration_name } =
                    setupDetailsState;

                  const localIdentity = `${profile}/device/${registration_name}`;
                  // console.log("Message:", message);
                  let isLocalMessage = false;
                  if (message.body && "unencrypted" in message.body) {
                    isLocalMessage =
                      message.body.unencrypted.internal_metadata
                        .sender_subidentity === localIdentity;
                  }

                  return (
                    <IonItem
                      key={index}
                      lines="none"
                      className={cn(
                        "ion-item-chat relative w-full shadow",
                        isLocalMessage && "isLocalMessage"
                      )}
                    >
                      <div className="px-2 py-4 flex gap-4 pb-10 w-full">
                        <Avatar
                          className="shrink-0 mr-4"
                          url={
                            isLocalMessage
                              ? "https://ui-avatars.com/api/?name=Me&background=FE6162&color=fff"
                              : "https://ui-avatars.com/api/?name=O&background=363636&color=fff"
                          }
                        />

                        <p>
                          {message.body && "unencrypted" in message.body
                            ? "unencrypted" in
                              message.body.unencrypted.message_data
                              ? message.body.unencrypted.message_data
                                  .unencrypted.message_raw_content
                              : message.body.unencrypted.message_data.encrypted
                                  .content
                            : message.body?.encrypted.content}
                        </p>
                        {message?.external_metadata?.scheduled_time && (
                          <span className="absolute bottom-[5px] right-5 text-muted text-sm">
                            {parseDate(
                              message.external_metadata.scheduled_time
                            ).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    </IonItem>
                  );
                })}
          </IonList>
          <div ref={bottomChatRef} />
        </div>
      </IonContentCustom>
      <IonFooterCustom>
        <form
          className={
            "flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative"
          }
          onSubmit={(e) => {
            e.preventDefault();
            if (inputMessage.trim() !== "") {
              sendMessage();
            }
          }}
        >
          <div className="m-2 relative flex h-full flex-1 md:flex-col">
            <IonTextarea
              class="ion-textarea-chat"
              rows={1}
              autoGrow
              fill="outline"
              className="m-0 w-full bg-transparent p-0 pl-2 pr-12 md:pl-0"
              value={inputMessage}
              onIonChange={(e) => setInputMessage(e.detail.value!)}
              placeholder="Type a message"
            ></IonTextarea>

            <button
              onClick={sendMessage}
              aria-label="Send Message"
              className={cn(
                "absolute z-10 p-3 rounded-md text-gray-500 bottom-[1px] right-1",
                "md:bottom-2.5 md:right-2",
                "hover:bg-gray-100 disabled:hover:bg-transparent",
                "dark:text-white dark:hover:text-gray-100 dark:hover:bg-gray-700 dark:disabled:hover:bg-transparent"
              )}
            >
              <IonIcon size="" icon={send} />
            </button>
          </div>
        </form>
      </IonFooterCustom>
    </IonPage>
  );
};

export default Chat;
