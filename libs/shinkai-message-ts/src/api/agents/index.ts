import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  CreateAgentRequest,
  CreateAgentResponse,
  GetAgentRequest,
  GetAgentResponse,
  GetAgentsResponse,
  RemoveAgentRequest,
  RemoveAgentResponse,
  UpdateAgentRequest,
  UpdateAgentResponse,
} from './types';

export const createAgent = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CreateAgentRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/add_agent'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CreateAgentResponse;
};

export const removeAgent = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemoveAgentRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/remove_agent'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as RemoveAgentResponse;
};

export const updateAgent = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UpdateAgentRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/update_agent'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as UpdateAgentResponse;
};

export const getAgent = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetAgentRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, `/v2/get_agent/${payload.agentId}`),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetAgentResponse;
};

export const getAgents = async (nodeAddress: string, bearerToken: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_all_agents'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetAgentsResponse;
};
