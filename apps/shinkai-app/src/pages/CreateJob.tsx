// pages/CreateJob.tsx
import {
  IonPage,
  IonTitle,
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
} from "@ionic/react";
import { useEffect, useState } from "react";
import { IonContentCustom, IonHeaderCustom } from "../components/ui/Layout";
import Button from "../components/ui/Button";
import {
  createJob, getProfileAgents, sendMessageToJob
} from "@shinkai_network/shinkai-message-ts/api";
import { SerializedAgent } from "@shinkai_network/shinkai-message-ts/models";
import { JobScopeWrapper, InboxNameWrapper, JobCreationWrapper } from "@shinkai_network/shinkai-message-ts/wasm";
import { useSetup } from "../hooks/usetSetup";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { History } from "history";
import { useHistory } from "react-router-dom";
import { addAgents } from "../store/actions";

const CreateJob: React.FC = () => {
  useSetup();
  const dispatch = useDispatch();
  const setupDetailsState = useSelector(
    (state: RootState) => state.setupDetails
  );
  const [jobContent, setJobContent] = useState("");
  const [selectedAgent, setSelectedAgent] = useState<SerializedAgent | null>(
    null
  );
  const agents = useSelector((state: RootState) => state.other.agents);
  const history: History<unknown> = useHistory();

  useEffect(() => {
    const fetchAgents = async () => {
      const { shinkai_identity, profile, registration_name } =
        setupDetailsState;
      const node_name = shinkai_identity;
      const sender_subidentity = `${profile}/device/${registration_name}`;

      const profiles = await getProfileAgents(
        node_name,
        sender_subidentity,
        node_name,
        setupDetailsState
      );
      dispatch(addAgents(profiles));
    };

    fetchAgents();
  }, [dispatch, setupDetailsState]);

  const handleCreateJob = async () => {
    console.log("Creating job with content:", jobContent);

    const { shinkai_identity, profile } = setupDetailsState;
    const sender = shinkai_identity + "/" + profile;

    const job_creation = JobCreationWrapper.empty().get_scope;
    console.log("buckets: ", job_creation.buckets);
    console.log("scope:", job_creation);

    const scope = new JobScopeWrapper(
      job_creation.buckets,
      job_creation.documents
    );
    console.log("scope:", scope.to_jsvalue());

    console.log("Selected agent:", selectedAgent);

    const receiver = shinkai_identity;
    const receiver_subidentity = `${profile}/agent/${selectedAgent?.id}`;

    // Call createJob
    const jobId = await createJob(
      scope.to_jsvalue(),
      sender,
      receiver,
      receiver_subidentity,
      setupDetailsState
    );
    console.log("Job created with id:", jobId);

    if (jobId) {
      const result = await sendMessageToJob(
        jobId.toString(),
        jobContent,
        sender,
        receiver,
        receiver_subidentity,
        setupDetailsState
      );
      dispatch({ type: "SEND_MESSAGE_SUCCESS", payload: result });

      // Hacky solution because react-router can't handle dots in the URL
      const jobInboxName = InboxNameWrapper.get_job_inbox_name_from_params(
        jobId.toString()
      );
      const encodedJobId = jobInboxName.get_value.replace(/\./g, "~");
      history.push(`/job-chat/${encodeURIComponent(encodedJobId)}`);
    }
  };

  return (
    <IonPage>
      <IonHeaderCustom>
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
        <IonTitle>Create Job</IonTitle>
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
                New Job Details
              </h2>

              <IonItem>
                <IonLabel>Select Agent</IonLabel>
                <IonSelect
                  value={selectedAgent}
                  placeholder="Select One"
                  onIonChange={(e) => setSelectedAgent(e.detail.value)}
                >
                  {Object.values(agents).map((agent, index) => (
                    <IonSelectOption key={index} value={agent}>
                      {agent.id}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="floating">Tell me the job to do</IonLabel>
                <IonTextarea
                  value={jobContent}
                  onIonChange={(e) => setJobContent(e.detail.value!)}
                />
              </IonItem>

              <div style={{ marginTop: "20px" }}>
                <Button onClick={handleCreateJob}>Create Job</Button>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContentCustom>
    </IonPage>
  );
};

export default CreateJob;
