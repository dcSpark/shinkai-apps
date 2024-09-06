import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  GetToolResponse,
  GetToolsResponse,
  ListAllWorkflowsResponse,
  PayInvoiceRequest,
  SearchWorkflowsResponse,
  UpdateToolRequest,
  UpdateToolResponse,
} from './types';

export const listAllWorkflows = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_all_workflows'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as ListAllWorkflowsResponse;
};
export const searchWorkflows = async (
  nodeAddress: string,
  bearerToken: string,
  query: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/search_workflows'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { query },
      responseType: 'json',
    },
  );
  return response.data as SearchWorkflowsResponse;
};

export const getTool = async (
  nodeAddress: string,
  bearerToken: string,
  toolKey: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_shinkai_tool'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { tool_name: toolKey },
      responseType: 'json',
    },
  );
  return response.data as GetToolResponse;
};

export const getTools = async (nodeAddress: string, bearerToken: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_all_shinkai_tools'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetToolsResponse;
};

export const searchTools = async (
  nodeAddress: string,
  bearerToken: string,
  query: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/search_shinkai_tool'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { query },
      responseType: 'json',
    },
  );
  return response.data as GetToolsResponse;
};

export const updateTool = async (
  nodeAddress: string,
  bearerToken: string,
  toolKey: string,
  payload: UpdateToolRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_shinkai_tool'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { tool_name: encodeURI(toolKey) },
      responseType: 'json',
    },
  );
  return response.data as UpdateToolResponse;
};

export const payInvoice = async (
  nodeAddress: string,
  bearerToken: string,
  payload: PayInvoiceRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/pay_invoice'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
