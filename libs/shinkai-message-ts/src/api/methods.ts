/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from '../http-client';
import {
  CreateChatInboxResponse,
  CredentialsPayload,
  ShinkaiMessage,
} from '../models';
import { InboxNameWrapper } from '../pkg/shinkai_message_wasm';
import { urlJoin } from '../utils/url-join';
import { ShinkaiMessageBuilderWrapper } from '../wasm/ShinkaiMessageBuilderWrapper';
import { ShinkaiNameWrapper } from '../wasm/ShinkaiNameWrapper';
import { uploadFilesToJob } from './jobs';
import { DirectoryContent } from './vector-fs/types';

export const createChatWithMessage = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  text_message: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ inboxId: string }> => {
  const senderShinkaiName = new ShinkaiNameWrapper(
    sender + '/' + sender_subidentity,
  );
  const receiverShinkaiName = new ShinkaiNameWrapper(
    receiver + '/' + receiver_subidentity,
  );

  const senderProfile = senderShinkaiName.extract_profile();
  const receiverProfile = receiverShinkaiName.extract_profile();

  const inbox = InboxNameWrapper.get_regular_inbox_name_from_params(
    senderProfile.get_node_name,
    senderProfile.get_profile_name,
    receiverProfile.get_node_name,
    receiverProfile.get_profile_name,
    true,
  );

  const messageStr = ShinkaiMessageBuilderWrapper.create_chat_with_message(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
    text_message,
    inbox.get_value,
  );

  const message: ShinkaiMessage = JSON.parse(messageStr);

  const response = await httpClient.post<CreateChatInboxResponse>(
    urlJoin(nodeAddress, '/v1/send'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;

  if (message.body && 'unencrypted' in message.body) {
    const inboxId = message.body.unencrypted.internal_metadata.inbox;
    return { inboxId };
  } else {
    return { inboxId: data.data.inbox };
  }
};

export const sendTextMessageWithInbox = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  text_message: string,
  inbox_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ inboxId: string }> => {
  // Note(Nico): we are forcing to send messages from profiles by removing device related stuff
  const senderShinkaiName = new ShinkaiNameWrapper(
    sender + '/' + sender_subidentity,
  );
  const senderProfile = senderShinkaiName.get_profile_name;

  const messageStr = ShinkaiMessageBuilderWrapper.send_text_message_with_inbox(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    sender,
    senderProfile,
    receiver,
    '',
    inbox_name,
    text_message,
  );

  const message: ShinkaiMessage = JSON.parse(messageStr);

  const response = await httpClient.post<CreateChatInboxResponse>(
    urlJoin(nodeAddress, '/v1/send'),
    message,

    {
      responseType: 'json',
    },
  );
  const data: CreateChatInboxResponse = response.data;

  if (message.body && 'unencrypted' in message.body) {
    const inboxId = message.body.unencrypted.internal_metadata.inbox;
    return { inboxId };
  } else {
    return { inboxId: data.data.inbox };
  }
};

export const sendTextMessageWithFilesToJob = async (
  nodeAddress: string,
  text_message: string,
  job_id: string,
  files: File[],
  bearerToken: string,
): Promise<{ message: ShinkaiMessage }> => {
  // Upload files using the uploadFilesToJob function
  const uploadResponses = await uploadFilesToJob(
    nodeAddress,
    bearerToken,
    job_id,
    files,
  );

  // Extract file paths from the upload responses
  const filenames = uploadResponses.map((response) => response.filename);

  // Prepare the message payload
  const messagePayload = {
    job_message: {
      job_id,
      content: text_message,
      fs_files_paths: [],
      job_filenames: filenames,
    },
  };

  // Send the message to the job
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/job_message'),
    messagePayload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bearerToken}`,
      },
    },
  );

  const data = response.data;

  // Assuming the response contains the message and inboxId
  return { message: data };
};

export const updateAgentInJob = async (
  nodeAddress: string,
  jobId: string,
  newAgentId: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: string; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.updateAgentInJob(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    jobId,
    newAgentId,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/change_job_agent'),
    message,
    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const retrieveVectorSearchSimplified = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  searchQuery: string,
  path: string | null = null,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr =
    ShinkaiMessageBuilderWrapper.retrieveVectorSearchSimplified(
      setupDetailsState.profile_encryption_sk,
      setupDetailsState.profile_identity_sk,
      setupDetailsState.node_encryption_pk,
      searchQuery,
      path,
      10,
      null,
      sender,
      sender_subidentity,
      receiver,
      receiver_subidentity,
    );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/retrieve_vector_search_simplified_json'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};

export const uploadFilesToVR = async (
  nodeAddress: string,
  bearerToken: string,
  destinationPath: string,
  files: File[],
): Promise<{ status: string }> => {
  try {
    for (const fileToUpload of files) {
      const formData = new FormData();
      formData.append('file_data', fileToUpload);
      formData.append('filename', fileToUpload.name);
      formData.append('path', destinationPath);

      const response = await httpClient.post(
        urlJoin(nodeAddress, '/v2/upload_file_to_folder'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Failed to upload file: ${fileToUpload.name}`);
      }
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error uploadFilesToVR:', error);
    throw error;
  }
};

// fetch details of vr file
export const retrieveVectorResource = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  path = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.retrieveResource(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/retrieve_vector_resource'),
    message,
    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return typeof data?.data === 'string'
    ? {
        data: JSON.parse(data.data),
        status: data.status,
      }
    : data;
};
export const moveFolderVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  originPath: string,
  destionationPath: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.moveFolder(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    originPath,
    destionationPath,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/move_folder'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};
export const searchItemsVR = async (
  nodeAddress: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  search: string,
  path = '/',
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.searchItems(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    search,
    path,
    null,
    null,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/vec_fs/search_items'),
    message,

    {
      responseType: 'json',
    },
  );

  const data = response.data;
  return data;
};

export const updateNodeName = async (
  nodeAddress: string,
  newNodeName: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.updateNodeName(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    newNodeName,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/change_nodes_name'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};
export const downloadVectorResource = async (
  nodeAddress: string,
  path: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.downloadVectorResource(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    path,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/retrieve_vrkai'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};
export const deleteLLMProvider = async (
  nodeAddress: string,
  agentId: string,
  sender: string,
  sender_subidentity: string,
  receiver: string,
  receiver_subidentity: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ data: any; status: string }> => {
  const messageStr = ShinkaiMessageBuilderWrapper.deleteLLMProvider(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    agentId,
    sender,
    sender_subidentity,
    receiver,
    receiver_subidentity,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/remove_agent'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const scanOllamaModels = async (
  nodeAddress: string,
  sender_subidentity: string,
  node_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ model: string }[]> => {
  const messageStr = ShinkaiMessageBuilderWrapper.scanOllamaModels(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    node_name,
    sender_subidentity,
    node_name,
    '',
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/scan_ollama_models'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const addOllamaModels = async (
  nodeAddress: string,
  senderSubidentity: string,
  nodeName: string,
  setupDetailsState: CredentialsPayload,
  payload: { models: string[] },
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.addOllamaModels(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    nodeName,
    senderSubidentity,
    nodeName,
    senderSubidentity,
    payload,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/add_ollama_models'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const retrieveFilesForJob = async (
  nodeAddress: string,
  bearerToken: string,
  payload: { job_id: string },
): Promise<DirectoryContent[]> => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/retrieve_files_for_job'),
    {
      params: payload,
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const setPreferences = async (
  nodeAddress: string,
  bearerToken: string,
  payload: { default_llm_provider?: string; max_iterations?: number },
): Promise<any> => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_preferences'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const getPreferences = async (
  nodeAddress: string,
  bearerToken: string,
): Promise<{ default_llm_provider?: string; max_iterations?: number }> => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_preferences'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
