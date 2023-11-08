import {
  AgentCredentialsPayload,
  CredentialsPayload,
  JobCredentialsPayload,
  LastMessagesFromInboxCredentialsPayload,
  SetupPayload,
  ShinkaiMessage,
  SmartInbox,
} from '../models';
import { APIUseRegistrationCodeSuccessResponse } from '../models/Payloads';
import { SerializedAgent } from '../models/SchemaTypes';
import { InboxNameWrapper } from '../pkg/shinkai_message_wasm';
import { calculateMessageHash } from '../utils';
import { FileUploader } from '../wasm/FileUploaderUsingSymmetricKeyManager';
import { SerializedAgentWrapper } from '../wasm/SerializedAgentWrapper';
import { ShinkaiMessageBuilderWrapper } from '../wasm/ShinkaiMessageBuilderWrapper';
import { ShinkaiNameWrapper } from '../wasm/ShinkaiNameWrapper';
import { ApiConfig } from './api_config';

// Helper function to handle HTTP errors
export const handleHttpError = async (response: Response): Promise<void> => {
  if (response.status < 200 || response.status >= 300) {
    let error: { code: string; error: string; message: string } | undefined;
    try {
      error = await response.json();
    } catch (e) {
      console.error(`Error parsing http error response ${response.body}`);
      error = undefined;
    }
    throw new Error(
      `HTTP error: ${response.status} ${error?.code}, ${error?.error}, ${error?.message}`
    );
  }
};

export const fetchPublicKey = () => async (): Promise<any> => {
  const apiEndpoint = ApiConfig.getInstance().getEndpoint();
  try {
    const response = await fetch(`${apiEndpoint}/get_public_key`);
    return response.json();
  } catch (error) {
    console.error('Error fetching public key:', error);
    throw error;
  }
};

export const createChatWithMessage = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  text_message: string,
  setupDetailsState: CredentialsPayload
): Promise<{ inboxId: string; message: ShinkaiMessage }> => {
  const senderShinkaiName = new ShinkaiNameWrapper(
    sender + '/' + sender_subidentity
  );
  const receiverShinkaiName = new ShinkaiNameWrapper(
    receiver + '/' + receiver_subidentity
  );

  const senderProfile = senderShinkaiName.extract_profile();
  const receiverProfile = receiverShinkaiName.extract_profile();

  const inbox = InboxNameWrapper.get_regular_inbox_name_from_params(
    senderProfile.get_node_name,
    senderProfile.get_profile_name,
    receiverProfile.get_node_name,
    receiverProfile.get_profile_name,
    true
  );

  try {
    const messageStr = ShinkaiMessageBuilderWrapper.create_chat_with_message(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
      text_message,
      inbox.get_value
    );

    const message: ShinkaiMessage = JSON.parse(messageStr);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/send`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);

    if (message.body && 'unencrypted' in message.body) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId, message };
    } else {
      throw new Error('message body is null or encrypted');
    }
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
};

export const sendTextMessageWithInbox = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  text_message: string,
  inbox_name: string,
  setupDetailsState: CredentialsPayload
): Promise<{ inboxId: string; message: ShinkaiMessage }> => {
  try {
    const messageStr =
      ShinkaiMessageBuilderWrapper.send_text_message_with_inbox(
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        sender_subidentity,
        receiver,
        '',
        inbox_name,
        text_message
      );

    const message: ShinkaiMessage = JSON.parse(messageStr);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/send`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    if (message.body && 'unencrypted' in message.body) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId, message };
    } else {
      throw new Error('message body is null or encrypted');
    }
  } catch (error) {
    console.error('Error sending text message:', error);
    throw error;
  }
};

export const sendTextMessageWithFilesForInbox = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  text_message: string,
  job_inbox: string,
  selectedFile: File,
  setupDetailsState: CredentialsPayload
): Promise<{ inboxId: string; message: ShinkaiMessage }> => {
  try {
    const fileUploader = new FileUploader(
      ApiConfig.getInstance().getEndpoint(),
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      job_inbox,
      sender,
      sender_subidentity,
      receiver
    );

    await fileUploader.createFolder();
    await fileUploader.uploadEncryptedFile(selectedFile);
    const responseText = await fileUploader.finalizeAndSend(text_message);
    const message: ShinkaiMessage = JSON.parse(responseText);

    if (message.body && 'unencrypted' in message.body) {
      const inboxId = message.body.unencrypted.internal_metadata.inbox;
      return { inboxId, message };
    } else {
      console.warn('message body is null or encrypted');
      // TODO: workaround to skip error reading encrypted message
      return { inboxId: job_inbox, message };
    }
  } catch (error) {
    console.error('Error sending text message with file:', error);
    throw error;
  }
};

export const getAllInboxesForProfile = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  target_shinkai_name_profile: string,
  setupDetailsState: CredentialsPayload
): Promise<SmartInbox[]> => {
  try {
    const messageString =
      ShinkaiMessageBuilderWrapper.get_all_inboxes_for_profile(
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        sender_subidentity,
        receiver,
        target_shinkai_name_profile
      );

    const message = JSON.parse(messageString);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(
      `${apiEndpoint}/v1/get_all_smart_inboxes_for_profile`,
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      }
    );
    const data = await response.json();
    await handleHttpError(response);
    return data.data;
  } catch (error) {
    console.error('Error getting all inboxes for profile:', error);
    throw error;
  }
};

export const updateInboxName = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
  inboxName: string,
  inboxId: string
): Promise<{ success: string; data: null }> => {
  try {
    const messageString =
      ShinkaiMessageBuilderWrapper.update_shinkai_inbox_name(
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        sender_subidentity,
        receiver,
        '',
        inboxId,
        inboxName
      );

    const message = JSON.parse(messageString);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/update_smart_inbox_name`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    await handleHttpError(response);
    return data;
  } catch (error) {
    console.error('Error updating inbox name:', error);
    throw error;
  }
};

export const getLastMessagesFromInbox = async (
  inbox: string,
  count: number,
  lastKey: string | undefined,
  setupDetailsState: LastMessagesFromInboxCredentialsPayload
): Promise<ShinkaiMessage[]> => {
  try {
    const messageStr =
      ShinkaiMessageBuilderWrapper.get_last_messages_from_inbox(
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        inbox,
        count,
        lastKey,
        setupDetailsState.shinkai_identity,
        setupDetailsState.profile,
        setupDetailsState.shinkai_identity
      );

    const message = JSON.parse(messageStr);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/last_messages_from_inbox`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting last messages from inbox:', error);
    throw error;
  }
};

export const submitRequestRegistrationCode = async (
  identity_permissions: string,
  code_type = 'profile',
  setupDetailsState: SetupPayload
): Promise<string> => {
  try {
    // TODO: refactor the profile name to be a constant
    // maybe we should add ShinkaiName and InboxName to the wasm library (just ADDED them this needs refactor)
    const sender_profile_name =
      setupDetailsState.profile +
      '/device/' +
      setupDetailsState.registration_name;

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

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/create_registration_code`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });

    await handleHttpError(response);
    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error('Error creating registration code:', error);
    throw error;
  }
};

export const submitRegistrationCode = async (
  setupData: SetupPayload
): Promise<boolean> => {
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
        setupData.profile || '', // sender_profile_name: it doesn't exist yet in the Node
        setupData.shinkai_identity
      );

    const message = JSON.parse(messageStr);

    // Use node_address from setupData for API endpoint
    const response = await fetch(
      `${setupData.node_address}/v1/use_registration_code`,
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    await handleHttpError(response);

    // Update the API_ENDPOINT after successful registration
    ApiConfig.getInstance().setEndpoint(setupData.node_address);
    return true;
  } catch (error) {
    console.error('Error using registration code:', error);
    return false;
  }
};

export const submitInitialRegistrationNoCode = async (
  setupData: SetupPayload
): Promise<{
  success: boolean;
  data?: APIUseRegistrationCodeSuccessResponse;
}> => {
  try {
    const messageStr =
      ShinkaiMessageBuilderWrapper.initial_registration_with_no_code_for_device(
        setupData.my_device_encryption_sk,
        setupData.my_device_identity_sk,
        setupData.profile_encryption_sk,
        setupData.profile_identity_sk,
        setupData.registration_name,
        setupData.registration_name,
        setupData.profile || '', // sender_profile_name: it doesn't exist yet in the Node
        setupData.shinkai_identity
      );

    const message = JSON.parse(messageStr);

    // Use node_address from setupData for API endpoint
    const response = await fetch(
      `${setupData.node_address}/v1/use_registration_code`,
      {
        method: 'POST',
        body: JSON.stringify(message),
        headers: { 'Content-Type': 'application/json' },
      }
    );

    await handleHttpError(response);

    // Update the API_ENDPOINT after successful registration
    ApiConfig.getInstance().setEndpoint(setupData.node_address);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error('Error in initial registration:', error);
    return { success: false };
  }
};

export const pingAllNodes = async (): Promise<string> => {
  const apiEndpoint = ApiConfig.getInstance().getEndpoint();
  try {
    const response = await fetch(`${apiEndpoint}/ping_all`, { method: 'POST' });
    await handleHttpError(response);
    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error('Error pinging all nodes:', error);
    throw error;
  }
};

export const createJob = async (
  scope: any,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: JobCredentialsPayload
): Promise<string> => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.job_creation(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      scope,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity
    );

    const message = JSON.parse(messageStr);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/create_job`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

export const sendMessageToJob = async (
  jobId: string,
  content: string,
  files_inbox: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: JobCredentialsPayload
): Promise<string> => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.job_message(
      jobId,
      content,
      files_inbox,
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity
    );

    const message = JSON.parse(messageStr);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/job_message`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    // TODO: response to create message job just contain an string replying "Job message processed successfully"
    return response.text();
  } catch (error) {
    console.error('Error sending message to job:', error);
    throw error;
  }
};

export const getProfileAgents = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  setupDetailsState: CredentialsPayload
): Promise<SerializedAgent[]> => {
  try {
    const messageStr = ShinkaiMessageBuilderWrapper.get_profile_agents(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      sender,
      sender_subidentity,
      receiver
    );

    const message = JSON.parse(messageStr);
    console.log('Get Profile Agents Message:', message);
    const messageHash = calculateMessageHash(message);
    console.log('Get Profile Agents Message Hash:', messageHash);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/available_agents`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error sending message to job:', error);
    throw error;
  }
};

export const addAgent = async (
  sender_subidentity: string,
  node_name: string,
  agent: SerializedAgent,
  setupDetailsState: AgentCredentialsPayload
) => {
  try {
    const agent_wrapped = SerializedAgentWrapper.fromSerializedAgent(agent);
    const messageStr = ShinkaiMessageBuilderWrapper.request_add_agent(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      node_name,
      sender_subidentity,
      node_name,
      agent_wrapped
    );

    const message = JSON.parse(messageStr);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/add_agent`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    await handleHttpError(response);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending message to add agent:', error);
    throw error;
  }
};

export const getFileNames = async (
  sender: string,
  sender_subidentity: string,
  receiver: string,
  setupDetailsState: {
    profile_encryption_sk: string,
    profile_identity_sk: string,
    node_encryption_pk: string,
  },
  inboxId: string,
  fileInbox: string,
): Promise<{ success: string; data: string[] }> => {
  try {
    const messageString =
      ShinkaiMessageBuilderWrapper.get_filenames_for_file_inbox(
        setupDetailsState.profile_encryption_sk,
        setupDetailsState.profile_identity_sk,
        setupDetailsState.node_encryption_pk,
        sender,
        sender_subidentity,
        receiver,
        '',
        inboxId,
        fileInbox
      );

    const message = JSON.parse(messageString);

    const apiEndpoint = ApiConfig.getInstance().getEndpoint();
    const response = await fetch(`${apiEndpoint}/v1/get_filenames_for_file_inbox`, {
      method: 'POST',
      body: JSON.stringify(message),
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    await handleHttpError(response);
    return data;
  } catch (error) {
    console.error('Error updating inbox name:', error);
    throw error;
  }
};
