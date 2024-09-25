import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  AddToolRequest,
  AddWorkflowRequest,
  AddWorkflowResponse,
  CreatePromptRequest,
  CreatePromptResponse,
  DeletePromptRequest,
  GetAllPromptsResponse,
  GetToolResponse,
  GetToolsResponse,
  ListAllWorkflowsResponse,
  PayInvoiceRequest,
  SearchPromptsResponse,
  SearchWorkflowsResponse,
  UpdatePromptRequest,
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

export const createWorkflow = async (
  nodeAddress: string,
  bearerToken: string,
  payload: AddWorkflowRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_workflow'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as AddWorkflowResponse;
};

export const createTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: AddToolRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/add_shinkai_tool'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as UpdateToolResponse;
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
export const getAllPrompts = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_all_custom_prompts'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetAllPromptsResponse;
};

export const searchPrompt = async (
  nodeAddress: string,
  bearerToken: string,
  query: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/search_custom_prompts'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { query },
      responseType: 'json',
    },
  );
  return response.data as SearchPromptsResponse;
};

export const createPrompt = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CreatePromptRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/add_custom_prompt'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CreatePromptResponse;
};
export const updatePrompt = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UpdatePromptRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/update_custom_prompt'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const removePrompt = async (
  nodeAddress: string,
  bearerToken: string,
  payload: DeletePromptRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/delete_custom_prompt'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
