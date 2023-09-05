// pages/AddAgent.tsx
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
  IonSelect,
  IonSelectOption,
  IonTextarea,
  InputChangeEventDetail,
  IonCheckbox,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { IonContentCustom, IonHeaderCustom } from "../components/ui/Layout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { SerializedAgent, AgentAPIModel } from "../models/SchemaTypes";
import { addAgent } from "../api";
import { useSetup } from "../hooks/usetSetup";

const AddAgent: React.FC = () => {
  useSetup();
  const dispatch = useDispatch();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetailsState
  );
  const [agent, setAgent] = useState<Partial<SerializedAgent>>({
    perform_locally: false,
    toolkit_permissions: [],
    storage_bucket_permissions: [],
    allowed_message_senders: [],
  });
  const [openaiModelType, setOpenaiModelType] =
    useState<string>("gpt-3.5-turbo");

  const handleInputChange = (event: CustomEvent<InputChangeEventDetail>) => {
    const inputElement = event.target as HTMLInputElement;
    const { name } = inputElement;
    const { value } = event.detail;
    // const { shinkai_identity, profile } = setupDetailsState;
    // const node_name = shinkai_identity;
    // const base = node_name + "/" + profile;
    // setAgent({ ...agent, full_identity_name: `${base}/${value}` });
    setAgent((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleAgentNameChange = (
    event: CustomEvent<InputChangeEventDetail>
  ) => {
    const base = `${setupDetailsState.shinkai_identity}/${setupDetailsState.profile}/agent`;
    setAgent({
      ...agent,
      full_identity_name: `${base}/${event.detail.value}`,
      id: event.detail.value ?? "",
    });
  };

  const handleSubmit = () => {
    const { shinkai_identity, profile } = setupDetailsState;
    let node_name = shinkai_identity;

    if (agent.model?.OpenAI) {
      setAgent({
        ...agent,
        model: { OpenAI: { model_type: openaiModelType } },
      });
    }

    console.log("Submitting agent:", agent);
    dispatch(
      addAgent(
        profile,
        node_name,
        agent as SerializedAgent,
        setupDetailsState
      )
    );
  };

  return (
    <IonPage>
      <IonHeaderCustom>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle>Add Agent</IonTitle>
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
                New Agent Details
              </h2>

              <IonItem>
                <IonLabel>Agent Name</IonLabel>
                <IonInput
                  id="agent_name"
                  value={agent.full_identity_name?.split("/").pop()}
                  onIonChange={handleAgentNameChange}
                />
              </IonItem>

              <IonItem>
                <IonLabel>Perform Locally</IonLabel>
                <IonCheckbox
                  slot="start"
                  name="perform_locally"
                  checked={agent.perform_locally}
                  onIonChange={(e) =>
                    setAgent((prevState) => ({
                      ...prevState,
                      perform_locally: e.detail.checked,
                    }))
                  }
                />
              </IonItem>

              <IonItem>
                <IonLabel>External URL</IonLabel>
                <IonInput
                  name="external_url"
                  value={agent.external_url}
                  onIonChange={handleInputChange}
                />
              </IonItem>

              <IonItem>
                <IonLabel>API Key</IonLabel>
                <IonInput
                  name="api_key"
                  value={agent.api_key}
                  onIonChange={handleInputChange}
                />
              </IonItem>

              <IonItem>
                <IonLabel>Model</IonLabel>
                <IonSelect
                  name="model"
                  value={agent.model}
                  onIonChange={(e) =>
                    setAgent((prevState) => ({
                      ...prevState,
                      model: e.detail.value as AgentAPIModel,
                    }))
                  }
                >
                  <IonSelectOption
                    value={{ OpenAI: { model_type: openaiModelType } }}
                  >
                    OpenAI
                  </IonSelectOption>
                  <IonSelectOption value={{ SleepAPI: {} }}>
                    SleepAPI
                  </IonSelectOption>
                </IonSelect>
              </IonItem>
              {agent.model?.OpenAI && (
                <IonItem>
                  <IonLabel>OpenAI Model Type</IonLabel>
                  <IonInput
                    name="openai_model_type"
                    value={openaiModelType}
                    onIonChange={(e) => setOpenaiModelType(e.detail.value!)}
                  />
                </IonItem>
              )}

              <div style={{ marginTop: "20px" }}>
                <Button onClick={handleSubmit}>Add Agent</Button>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContentCustom>
    </IonPage>
  );
};

export default AddAgent;
