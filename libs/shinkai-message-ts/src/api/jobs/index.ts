import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  AddFileToInboxRequest,
  AddFileToInboxResponse,
  AddLLMProviderRequest,
  AddLLMProviderResponse,
  CreateFilesInboxResponse,
  CreateJobRequest,
  CreateJobResponse,
  GetAllInboxesResponse,
  GetLastMessagesRequest,
  GetLastMessagesResponse,
  GetLLMProvidersResponse,
  JobMessageRequest,
  JobMessageResponse,
  LLMProviderInterface,
} from './types';

export const createJob = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CreateJobRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/create_job'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  const data = response.data;
  return data as CreateJobResponse;
};

export const sendMessageToJob = async (
  nodeAddress: string,
  bearerToken: string,
  payload: JobMessageRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/job_message'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as JobMessageResponse;
};

export const getLastMessages = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetLastMessagesRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/last_messages'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetLastMessagesResponse;
};

export const createFilesInbox = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/create_files_inbox'),
    undefined,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CreateFilesInboxResponse;
};

export const addFileToInbox = async (
  nodeAddress: string,
  bearerToken: string,
  payload: AddFileToInboxRequest,
) => {
  const fileData = await payload.file.arrayBuffer();

  const formData = new FormData();
  formData.append('file_inbox_name', payload.file_inbox_name);
  formData.append('filename', payload.filename);
  formData.append('file_data', new Blob([fileData]));

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/add_file_to_inbox'),
    formData,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );

  return response.data as AddFileToInboxResponse;
};

export const uploadFilesToInbox = async (
  nodeAddress: string,
  bearerToken: string,
  files: File[],
) => {
  const folderId = await createFilesInbox(nodeAddress, bearerToken);
  for (const file of files) {
    await addFileToInbox(nodeAddress, bearerToken, {
      filename: file.name,
      file_inbox_name: folderId,
      file,
    });
  }
  return folderId;
};

export const getLLMProviders = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/available_models'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetLLMProvidersResponse;
};

function getModelString(model: LLMProviderInterface): string {
  if (model?.OpenAI?.model_type) {
    return 'openai:' + model.OpenAI.model_type;
  } else if (model?.GenericAPI?.model_type) {
    return 'genericapi:' + model.GenericAPI.model_type;
  } else if (model?.Ollama?.model_type) {
    return 'ollama:' + model.Ollama.model_type;
  } else if (model?.Gemini?.model_type) {
    return 'gemini:' + model.Gemini.model_type;
  } else if (model?.Exo?.model_type) {
    return 'exo:' + model.Exo.model_type;
  } else if (Object.keys(model).length > 0) {
    const customModelProvider = Object.keys(model)[0];
    return `${customModelProvider}:${model[customModelProvider].model_type}`;
  } else {
    throw new Error('Invalid model: ' + JSON.stringify(model));
  }
}

export const addLLMProvider = async (
  nodeAddress: string,
  bearerToken: string,
  payload: AddLLMProviderRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/add_llm_provider'),
    { ...payload, model: getModelString(payload.model) },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as AddLLMProviderResponse;
};

export const getAllInboxes = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/all_inboxes'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetAllInboxesResponse;
};
