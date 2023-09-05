// pages/CreateChat.tsx
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonInput,
  IonLabel,
  IonItem,
  IonGrid,
  IonRow,
  IonCol,
  IonButtons,
  IonBackButton,
  IonTextarea,
} from "@ionic/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createChatWithMessage } from "../api";
import { useSetup } from "../hooks/usetSetup";
import { RootState } from "../store/reducers";
import { useHistory } from "react-router-dom";
import { History } from "history";
import { IonContentCustom, IonHeaderCustom } from "../components/ui/Layout";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const CreateChat: React.FC = () => {
  useSetup();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetailsState,
  );
  const [shinkaiIdentity, setShinkaiIdentity] = useState("");
  const [messageText, setMessageText] = useState("");
  const dispatch = useDispatch();
  const history: History<unknown> = useHistory();

  const handleCreateChat = async () => {
    // Perform your API request here
    console.log("Creating chat with Shinkai Identity:", shinkaiIdentity);

    // Split shinkaiIdentity into sender and the rest
    let [receiver, ...rest] = shinkaiIdentity.split("/");

    // Join the rest back together to form sender_subidentity
    let receiver_subidentity = rest.join("/");

    // Local Identity
    const { shinkai_identity, profile, registration_name } = setupDetailsState;

    let sender = shinkai_identity;
    let sender_subidentity = `${profile}/device/${registration_name}`;
    // console.log("Sender:", shinkai_identity);
    // console.log("Sender Subidentity:", `${profile}/device/${registration_name}`);

    // Send a message to someone
    let inboxId = await dispatch(
      createChatWithMessage(
        sender,
        sender_subidentity,
        receiver,
        receiver_subidentity,
        messageText,
        setupDetailsState,
      ),
    );

    if (inboxId) {
      // Hacky solution because react-router can't handle dots in the URL
      const encodedInboxId = inboxId.toString().replace(/\./g, "~");
      history.push(`/chat/${encodeURIComponent(encodedInboxId)}`);
    }
  };

  return (
    <IonPage>
      <IonHeaderCustom>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle>Create Chat</IonTitle>
      </IonHeaderCustom>
      <IonContentCustom>
        <IonGrid
          className={
            "md:rounded-[1.25rem] bg-white dark:bg-slate-800 p-4 md:p-10 space-y-2 md:space-y-4"
          }
        >
          <IonRow>
            <IonCol>
              <h2 className={"text-lg mb-3 md:mb-8 text-center"}>
                New Chat Details
              </h2>
              <div className={"space-y-5"}>
                <Input
                  value={shinkaiIdentity}
                  label="Enter Shinkai Identity. Eg:@@name.shinkai or @@name.shinkai/profile"
                  aria-label="Enter Shinkai Identity"
                  onChange={(e) => setShinkaiIdentity(e.detail.value!)}
                />

                <Input
                  label="Enter Message"
                  aria-label="Enter Message"
                  value={messageText}
                  onChange={(e) => setMessageText(e.detail.value!)}
                />
              </div>

              <div style={{ marginTop: "20px" }}>
                <Button onClick={handleCreateChat}>Create Chat</Button>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContentCustom>
    </IonPage>
  );
};

export default CreateChat;
