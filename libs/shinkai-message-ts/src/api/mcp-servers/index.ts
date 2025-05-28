import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  AddMcpServerRequest,
  DeleteMcpServerRequest,
  GetMcpServersResponse,
  GetMcpServerToolsRequest,
  GetMcpServerToolsResponse,
  ImportMcpServerFromGithubUrlRequest,
  McpServer,
  UpdateMcpServerRequest,
} from './types';

export const getMcpServers = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_mcp_servers'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetMcpServersResponse;
};

export const getMcpServerTools = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetMcpServerToolsRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, `/v2/mcp_server_tools?mcp_server_id=${payload.id}`),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetMcpServerToolsResponse;
};

export const addMcpServer = async (
  nodeAddress: string,
  bearerToken: string,
  payload: AddMcpServerRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/add_mcp_server'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as McpServer;
};

export const updateMcpServer = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UpdateMcpServerRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/update_mcp_server'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as McpServer;
};

export const deleteMcpServer = async (
  nodeAddress: string,
  bearerToken: string,
  payload: DeleteMcpServerRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/delete_mcp_server'),
    {
      mcp_server_id: payload.id,
    },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as McpServer;
};

export const importMcpServerFromGithubUrl = async (
  nodeAddress: string,
  bearerToken: string,
  payload: ImportMcpServerFromGithubUrlRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/import_mcp_server_from_github_url'),
    {
      github_url: payload.url,
    },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as McpServer;
};

export const setEnableMcpServer = async (
  nodeAddress: string,
  bearerToken: string,
  mcpServerId: number,
  isEnabled: boolean,
): Promise<{ success: boolean }> => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_enable_mcp_server'),
    {
      mcp_server_id: mcpServerId,
      is_enabled: isEnabled,
    },
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
