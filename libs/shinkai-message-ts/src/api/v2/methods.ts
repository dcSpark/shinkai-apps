import { httpClient } from '../../http-client';
import {
  CreateJobRequest,
  CreateJobResponse,
  GetLastMessagesRequest,
  GetLastMessagesResponse,
  JobMessageRequest,
  JobMessageResponse,
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
