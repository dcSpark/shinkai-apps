import axios from "axios";
import { AppDispatch } from "../store/index";
import {
  getPublicKey,
  useRegistrationCode,
  pingAll,
  createRegistrationCode,
  registrationError,
  receiveLastMessagesFromInbox,
  addMessageToInbox,
  receiveAllInboxesForProfile,
  receiveLoadMoreMessagesFromInbox,
  addAgents,
} from "../store/actions";
import { AppThunk } from "../types";
import { ShinkaiMessageBuilderWrapper } from "../lib/wasm/ShinkaiMessageBuilderWrapper";
import { MergedSetupType } from "../pages/Connect";
import { ApiConfig } from "./api_config";
import { SetupDetailsState } from "../store/reducers";
import { ShinkaiMessage } from "../models/ShinkaiMessage";
import { ShinkaiNameWrapper } from "../lib/wasm/ShinkaiNameWrapper";
import { InboxNameWrapper } from "../pkg/shinkai_message_wasm";
import { SerializedAgent } from "../models/SchemaTypes";
import { SerializedAgentWrapper } from "../lib/wasm/SerializedAgentWrapper";

// Helper function to handle HTTP errors
export const handleHttpError = (response: any) => {
  if (response.status < 200 || response.status >= 300) {
    const error = response.data;
    throw new Error(
      `HTTP error: ${error.code}, ${error.error}, ${error.message}`
    );
  }
};

export const fetchPublicKey = () => async (dispatch: AppDispatch) => {
  const apiEndpoint = ApiConfig.getInstance().getEndpoint();
  try {
    const response = await axios.get(`${apiEndpoint}/get_public_key`);
    dispatch(getPublicKey(response.data));
  } catch (error) {
    console.error("Error fetching public key:", error);
  }
};

export const createChatWithMessage =
  (
    sender: string,
    sender_subidentity: string,
    receiver: string,
    receiver_subidentity: string,
    text_message: string,
    setupDetailsState: SetupDetailsState
  ) =>
  async (dispatch: AppDispatch) => {
    const senderShinkaiName = new ShinkaiNameWrapper(
      sender + "/" + sender_subidentity
    );
    const receiverShinkaiName = new ShinkaiNameWrapper(
      receiver + "/" + receiver_subidentity
    );

    const senderProfile = senderShinkaiName.extract_profile();
    const receiverProfile = receiverShinkaiName.extract_profile();

    let inbox = InboxNameWrapper.get_regular_inbox_name_from_params(
      senderProfile.get_node_name,
      senderProfile.get_profile_name,
      receiverProfile.get_node_name,
      receiverProfile.get_profile_name,
      true
    );

    try {
      const messageStr = ShinkaiMessageBuilderWrapper.create_chat_with_message(
        setupDetailsState.my_device_encryption_sk,
        setupDetailsState.my_device_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        sender_subidentity,
        receiver,
        receiver_subidentity,
        text_message,
        inbox.get_value
      );

      const message: ShinkaiMessage = JSON.parse(messageStr);
      // console.log("Message:", message);

      const apiEndpoint = ApiConfig.getInstance().getEndpoint();
      const response = await axios.post(`${apiEndpoint}/v1/send`, message);

      handleHttpError(response);
      if (message.body && "unencrypted" in message.body) {
        const inboxId = message.body.unencrypted.internal_metadata.inbox;
        dispatch(addMessageToInbox(inboxId, message));
        return inboxId;
      } else {
        console.error("Error: message body is null or encrypted");
      }
    } catch (error) {
      console.error("Error sending text message:", error);
    }
  };

export const sendTextMessageWithInbox =
  (
    sender: string,
    sender_subidentity: string,
    receiver: string,
    text_message: string,
    inbox_name: string,
    setupDetailsState: SetupDetailsState
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      const messageStr =
        ShinkaiMessageBuilderWrapper.send_text_message_with_inbox(
          setupDetailsState.my_device_encryption_sk,
          setupDetailsState.my_device_identity_sk,
          setupDetailsState.node_encryption_pk,
          sender,
          sender_subidentity,
          receiver,
          "",
          inbox_name,
          text_message
        );

      const message: ShinkaiMessage = JSON.parse(messageStr);
      console.log("Message:", message);

      const apiEndpoint = ApiConfig.getInstance().getEndpoint();
      const response = await axios.post(`${apiEndpoint}/v1/send`, message);

      handleHttpError(response);
      if (message.body && "unencrypted" in message.body) {
        const inboxId = message.body.unencrypted.internal_metadata.inbox;
        dispatch(addMessageToInbox(inboxId, message));
        return inboxId;
      } else {
        console.error("Error: message body is null or encrypted");
      }
    } catch (error) {
      console.error("Error sending text message:", error);
    }
  };

export const getAllInboxesForProfile =
  (
    sender: string,
    sender_subidentity: string,
    receiver: string,
    target_shinkai_name_profile: string,
    setupDetailsState: SetupDetailsState
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      const messageStr =
        ShinkaiMessageBuilderWrapper.get_all_inboxes_for_profile(
          setupDetailsState.my_device_encryption_sk,
          setupDetailsState.my_device_identity_sk,
          setupDetailsState.node_encryption_pk,
          sender,
          sender_subidentity,
          receiver,
          target_shinkai_name_profile
        );

      const message = JSON.parse(messageStr);
      console.log("Message:", message);

      const apiEndpoint = ApiConfig.getInstance().getEndpoint();
      const response = await axios.post(
        `${apiEndpoint}/v1/get_all_inboxes_for_profile`,
        message
      );

      handleHttpError(response);
      console.log("GetAllInboxesForProfile Response:", response.data);
      dispatch(receiveAllInboxesForProfile(response.data));
    } catch (error) {
      console.error("Error getting all inboxes for profile:", error);
    }
  };

export const getLastMessagesFromInbox =
  (
    inbox: string,
    count: number,
    lastKey: string | undefined,
    setupDetailsState: SetupDetailsState,
    previous: boolean = false
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      console.log("lastKey: ", lastKey);
      let sender =
        setupDetailsState.shinkai_identity + "/" + setupDetailsState.profile;

      const messageStr =
        ShinkaiMessageBuilderWrapper.get_last_messages_from_inbox(
          setupDetailsState.profile_encryption_sk,
          setupDetailsState.profile_identity_sk,
          setupDetailsState.node_encryption_pk,
          inbox,
          count,
          lastKey,
          sender,
          "",
          setupDetailsState.shinkai_identity
        );

      const message = JSON.parse(messageStr);
      console.log("Message:", message);

      const apiEndpoint = ApiConfig.getInstance().getEndpoint();
      const response = await axios.post(
        `${apiEndpoint}/v1/last_messages_from_inbox`,
        message
      );

      handleHttpError(response);
      let results = response.data;
      if (previous) {
        console.log("receiveLoadMoreMessagesFromInbox Response:", results);
        dispatch(receiveLoadMoreMessagesFromInbox(inbox, results));
      } else {
        console.log("receiveLastMessagesFromInbox Response:", results);
        dispatch(receiveLastMessagesFromInbox(inbox, results));
      }
    } catch (error) {
      console.error("Error getting last messages from inbox:", error);
    }
  };

export const submitRequestRegistrationCode =
  (
    identity_permissions: string,
    code_type = "profile",
    setupDetailsState: SetupDetailsState
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      // TODO: refactor the profile name to be a constant
      // maybe we should add ShinkaiName and InboxName to the wasm library (just ADDED them this needs refactor)
      let sender_profile_name =
        setupDetailsState.profile +
        "/device/" +
        setupDetailsState.registration_name;
      console.log("sender_profile_name:", sender_profile_name);
      console.log("identity_permissions:", identity_permissions);
      console.log("code_type:", code_type);

      const messageStr = ShinkaiMessageBuilderWrapper.request_code_registration(
        setupDetailsState.my_device_encryption_sk,
        setupDetailsState.my_device_identity_sk,
        setupDetailsState.node_encryption_pk,
        identity_permissions,
        code_type,
        sender_profile_name,
        setupDetailsState.shinkai_identity
      );

      const message = JSON.parse(messageStr);
      console.log("Message:", message);

      const apiEndpoint = ApiConfig.getInstance().getEndpoint();
      const response = await axios.post(
        `${apiEndpoint}/v1/create_registration_code`,
        message
      );

      handleHttpError(response);
      dispatch(createRegistrationCode(response.data.code));
    } catch (error) {
      console.error("Error creating registration code:", error);
    }
  };

export const submitRegistrationCode =
  (setupData: MergedSetupType): AppThunk =>
  async (dispatch: AppDispatch) => {
    try {
      const messageStr =
        ShinkaiMessageBuilderWrapper.use_code_registration_for_device(
          setupData.my_device_encryption_sk,
          setupData.my_device_identity_sk,
          setupData.profile_encryption_sk,
          setupData.profile_identity_sk,
          setupData.node_encryption_pk,
          setupData.registration_code,
          setupData.identity_type,
          setupData.permission_type,
          setupData.registration_name,
          "", // sender_profile_name: it doesn't exist yet in the Node
          setupData.shinkai_identity
        );

      const message = JSON.parse(messageStr);
      console.log(
        "submitRegistrationCode registration_name: ",
        setupData.registration_name
      );
      console.log(
        "submitRegistrationCode identity_type: ",
        setupData.identity_type
      );
      console.log(
        "submitRegistrationCode permission_type: ",
        setupData.permission_type
      );
      console.log("submitRegistrationCode Message:", message);

      // Use node_address from setupData for API endpoint
      let response = await axios.post(
        `${setupData.node_address}/v1/use_registration_code`,
        message
      );

      handleHttpError(response);

      // Update the API_ENDPOINT after successful registration
      ApiConfig.getInstance().setEndpoint(setupData.node_address);

      dispatch(useRegistrationCode(setupData));

      return true;
    } catch (error) {
      console.log("Error using registration code:", error);
      if (error instanceof Error) {
        dispatch(registrationError(error.message));
      }
      return false;
    }
  };

export const pingAllNodes = () => async (dispatch: AppDispatch) => {
  const apiEndpoint = ApiConfig.getInstance().getEndpoint();
  try {
    const response = await axios.post(`${apiEndpoint}/ping_all`);
    handleHttpError(response);
    dispatch(pingAll(response.data.result));
  } catch (error) {
    console.error("Error pinging all nodes:", error);
  }
};

export const createJob = async (
  scope: any,
  sender: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: SetupDetailsState
) => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.job_creation(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      scope,
      sender,
      receiver,
      receiver_subidentity
    );

    const message = JSON.parse(messageStr);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await axios.post(`${apiEndpoint}/v1/create_job`, message);
    handleHttpError(response);
    console.log("createJob Response:", response.data);
    const jobId = response.data;
    return jobId;
  } catch (error) {
    console.error("Error creating job:", error);
  }
};

export const sendMessageToJob =
  (
    jobId: string,
    content: string,
    sender: string,
    receiver: string,
    receiver_subidentity: string,
    setupDetailsState: SetupDetailsState
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      const messageStr = ShinkaiMessageBuilderWrapper.job_message(
        jobId,
        content,
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        receiver,
        receiver_subidentity
      );

      const message = JSON.parse(messageStr);
      // console.log("Message:", message);

      const apiEndpoint = ApiConfig.getInstance().getEndpoint();
      const response = await axios.post(
        `${apiEndpoint}/v1/job_message`,
        message
      );

      handleHttpError(response);
      dispatch(response.data);
    } catch (error) {
      console.error("Error sending message to job:", error);
    }
  };

export const getProfileAgents =
  (
    sender: string,
    sender_subidentity: string,
    receiver: string,
    setupDetailsState: SetupDetailsState
  ) =>
  async (dispatch: AppDispatch) => {
    try {
      const messageStr = ShinkaiMessageBuilderWrapper.get_profile_agents(
        setupDetailsState.my_device_encryption_sk,
        setupDetailsState.my_device_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        sender_subidentity,
        receiver
      );

      const message = JSON.parse(messageStr);
      // console.log("Message:", message);

      const apiEndpoint = ApiConfig.getInstance().getEndpoint();
      const response = await axios.post(
        `${apiEndpoint}/v1/available_agents`,
        message
      );

      console.log("getProfileAgents Response:", response.data);
      handleHttpError(response);
      dispatch(addAgents(response.data));
      return response.data;
    } catch (error) {
      console.error("Error sending message to job:", error);
    }
  };

export const addAgent = async (
  sender_subidentity: string,
  node_name: string,
  agent: SerializedAgent,
  setupDetailsState: SetupDetailsState
) => {
  try {
    let agent_wrapped = SerializedAgentWrapper.fromSerializedAgent(agent);
    const messageStr = ShinkaiMessageBuilderWrapper.request_add_agent(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      node_name + "/" + sender_subidentity,
      "",
      node_name,
      agent_wrapped
    );

    const message = JSON.parse(messageStr);
    // console.log("Message:", message);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await axios.post(`${apiEndpoint}/v1/add_agent`, message);

    console.log("addAgent Response:", response.data);
    handleHttpError(response);
    return response.data;
  } catch (error) {
    console.error("Error sending message to add agent:", error);
  }
};
