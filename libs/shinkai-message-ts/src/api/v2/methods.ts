import { httpClient } from '../../http-client';
import {
  AddFileToInboxRequest,
  AddFileToInboxResponse,
  CreateFilesInboxResponse,
  CreateJobRequest,
  CreateJobResponse,
  GetLastMessagesRequest,
  GetLastMessagesResponse,
  GetLLMProvidersResponse,
  JobMessageRequest,
  JobMessageResponse,
  ListAllWorkflowsResponse,
  SearchWorkflowsResponse,
} from '../../models/v2/types';
import { urlJoin } from '../../utils/url-join';

const BEARER_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikpva';

export const createJob = async (
  nodeAddress: string,
  payload: CreateJobRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/create_job'),
    payload,
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );
  const data = response.data;
  return data as CreateJobResponse;
};

export const sendMessageToJob = async (
  nodeAddress: string,
  payload: JobMessageRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/job_message'),
    payload,
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );
  return response.data as JobMessageResponse;
};

export const getLastMessages = async (
  nodeAddress: string,
  payload: GetLastMessagesRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/last_messages'),
    payload,
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );
  return response.data as GetLastMessagesResponse;
};

export const createFilesInbox = async (nodeAddress: string) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/create_files_inbox'),
    undefined,
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );
  return response.data as CreateFilesInboxResponse;
};

export const addFileToInbox = async (
  nodeAddress: string,
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
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );

  return response.data as AddFileToInboxResponse;
};

export const uploadFilesToInbox = async (
  nodeAddress: string,
  files: File[],
) => {
  const folderId = await createFilesInbox(nodeAddress);
  for (const file of files) {
    await addFileToInbox(nodeAddress, {
      filename: file.name,
      file_inbox_name: folderId,
      file,
    });
  }
  return folderId;
};

export const listAllWorkflows = async (nodeAddress: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_all_workflows'),
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );
  return response.data as ListAllWorkflowsResponse;
};
export const searchWorkflows = async (nodeAddress: string, query: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/search_workflows'),
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      params: { query },
      responseType: 'json',
    },
  );
  return response.data as SearchWorkflowsResponse;
};
export const getLLMProviders = async (nodeAddress: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/available_models'),
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );
  return response.data as GetLLMProvidersResponse;
};
