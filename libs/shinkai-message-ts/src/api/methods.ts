/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from '../http-client';
import { CredentialsPayload } from '../models';
import { urlJoin } from '../utils/url-join';
import { ShinkaiMessageBuilderWrapper } from '../wasm/ShinkaiMessageBuilderWrapper';
import { DirectoryContent } from './vector-fs/types';

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
