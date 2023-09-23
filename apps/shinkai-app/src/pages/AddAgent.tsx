// pages/AddAgent.tsx
import {
  InputChangeEventDetail,
  IonBackButton,
  IonButtons,
  IonCheckbox,
  IonCol,
  IonGrid,
  IonInput,
  IonItem,
  IonLabel,
  IonPage,
  IonRow,
  IonSelect,
  IonSelectOption,
  IonTitle,
} from "@ionic/react";
import { addAgent } from "@shinkai_network/shinkai-message-ts/api";
import { AgentAPIModel,SerializedAgent } from "@shinkai_network/shinkai-message-ts/models";
import { useState } from "react";
import { useSelector } from "react-redux";

import Button from "../components/ui/Button";
import { IonContentCustom, IonHeaderCustom } from "../components/ui/Layout";
import { useSetup } from "../hooks/usetSetup";
import { RootState } from "../store";

const AddAgent: React.FC = () => {
  useSetup();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetails
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

  const handleSubmit = async () => {
    const { shinkai_identity, profile } = setupDetailsState;
    const node_name = shinkai_identity;

    if (agent.model?.OpenAI) {
      setAgent({
        ...agent,
        model: { OpenAI: { model_type: openaiModelType } },
      });
    }

    console.log("Submitting agent:", agent);

    const resp = await addAgent(
      profile,
      node_name,
      agent as SerializedAgent,
      setupDetailsState
    );
    if (resp) {
      // TODO: show a success toast
      // eslint-disable-next-line no-restricted-globals
      history.back();
    }
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
                  onIonChange={handleAgentNameChange}
                  value={agent.full_identity_name?.split("/").pop()}
                />
              </IonItem>

              <IonItem>
                <IonLabel>Perform Locally</IonLabel>
                <IonCheckbox
                  checked={agent.perform_locally}
                  name="perform_locally"
                  onIonChange={(e) =>
                    setAgent((prevState) => ({
                      ...prevState,
                      perform_locally: e.detail.checked,
                    }))
                  }
                  slot="start"
                />
              </IonItem>

              <IonItem>
                <IonLabel>External URL</IonLabel>
                <IonInput
                  name="external_url"
                  onIonChange={handleInputChange}
                  value={agent.external_url}
                />
              </IonItem>

              <IonItem>
                <IonLabel>API Key</IonLabel>
                <IonInput
                  name="api_key"
                  onIonChange={handleInputChange}
                  value={agent.api_key}
                />
              </IonItem>

              <IonItem>
                <IonLabel>Model</IonLabel>
                <IonSelect
                  name="model"
                  onIonChange={(e) =>
                    setAgent((prevState) => ({
                      ...prevState,
                      model: e.detail.value as AgentAPIModel,
                    }))
                  }
                  value={agent.model}
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
                    onIonChange={(e) => setOpenaiModelType(e.detail.value!)}
                    value={openaiModelType}
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
