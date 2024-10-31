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
  GetChatConfigRequest,
  GetChatConfigResponse,
  GetFileNamesRequest,
  GetFileNamesResponse,
  GetJobScopeRequest,
  GetJobScopeResponse,
  GetLastMessagesRequest,
  GetLastMessagesResponse,
  GetLastMessagesWithBranchesRequest,
  GetLastMessagesWithBranchesResponse,
  GetLLMProvidersResponse,
  JobMessageRequest,
  JobMessageResponse,
  LLMProviderInterface,
  RemoveJobRequest,
  RemoveLLMProviderRequest,
  RetryMessageRequest,
  StopGeneratingLLMRequest,
  UpdateChatConfigRequest,
  UpdateChatConfigResponse,
  UpdateJobScopeRequest,
  UpdateLLMProviderRequest,
  UpdateLLMProviderResponse,
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
export const getLastMessagesWithBranches = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetLastMessagesWithBranchesRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/last_messages_with_branches'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetLastMessagesWithBranchesResponse;
};

export const getFileNames = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetFileNamesRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, `/v2/list_files_in_inbox/${payload.inboxName}`),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetFileNamesResponse;
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
      filename: encodeURIComponent(file.name),
      file_inbox_name: folderId,
      file,
    });
  }
  return folderId;
};

export const downloadFileFromInbox = async (
  nodeAddress: string,
  bearerToken: string,
  inboxName: string,
  filename: string,
) => {
  const response = await httpClient.get(
    urlJoin(
      nodeAddress,
      `/v2/download_file_from_inbox/${inboxName}/${decodeURIComponent(filename)}`,
    ),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'blob',
    },
  );
  return response.data as Blob;
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
  } else if (model?.TogetherAI?.model_type) {
    return 'togetherai:' + model.TogetherAI.model_type;
  } else if (model?.Ollama?.model_type) {
    return 'ollama:' + model.Ollama.model_type;
  } else if (model?.Gemini?.model_type) {
    return 'gemini:' + model.Gemini.model_type;
  } else if (model?.Groq?.model_type) {
    return 'groq:' + model.Groq.model_type;
  } else if (model?.OpenRouter?.model_type) {
    return 'openrouter:' + model.OpenRouter.model_type;
  } else if (model?.Exo?.model_type) {
    return 'exo:' + model.Exo.model_type;
  } else if (model?.Claude?.model_type) {
    return 'claude:' + model.Claude.model_type;
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

export const updateLLMProvider = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UpdateLLMProviderRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/modify_llm_provider'),
    { ...payload, model: getModelString(payload.model) },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as UpdateLLMProviderResponse;
};

export const removeLLMProvider = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemoveLLMProviderRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/remove_llm_provider'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
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

export const getJobConfig = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetChatConfigRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_job_config'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
      params: {
        job_id: payload.job_id,
      },
    },
  );
  return response.data as GetChatConfigResponse;
};

export const updateChatConfig = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UpdateChatConfigRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/update_job_config'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as UpdateChatConfigResponse;
};

export const stopGeneratingLLM = async (
  nodeAddress: string,
  bearerToken: string,
  jobId: StopGeneratingLLMRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/stop_llm'),
    { inbox_name: jobId },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const getJobScope = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetJobScopeRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_job_scope'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
      params: { job_id: payload.jobId },
    },
  );
  return response.data as GetJobScopeResponse;
};
export const updateJobScope = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UpdateJobScopeRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/update_job_scope'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const retryMessage = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RetryMessageRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/retry_message'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const removeJob = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemoveJobRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/remove_job'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
