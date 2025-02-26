import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  AddToolRequest,
  AddToolRequestRequest,
  AddToolRequestResponse,
  CreatePromptRequest,
  CreatePromptResponse,
  CreateToolCodeRequest,
  CreateToolCodeResponse,
  CreateToolMetadataRequest,
  CreateToolMetadataResponse,
  DeletePromptRequest,
  DuplicateToolRequest,
  DuplicateToolResponse,
  ExecuteToolCodeRequest,
  ExecuteToolCodeResponse,
  ExportToolRequest,
  ExportToolResponse,
  GetAllPromptsResponse,
  GetAllToolAssetsResponse,
  GetPlaygroundToolRequest,
  GetPlaygroundToolResponse,
  GetPlaygroundToolsResponse,
  GetShinkaiFileProtocolRequest,
  GetShinkaiFileProtocolResponse,
  GetToolResponse,
  GetToolsResponse,
  GetToolStoreDetailsRequest,
  GetToolStoreDetailsResponse,
  ImportToolRequest,
  ImportToolResponse,
  OpenToolInCodeEditorRequest,
  OpenToolInCodeEditorResponse,
  PayInvoiceRequest,
  PublishToolRequest,
  PublishToolResponse,
  RemovePlaygroundToolRequest,
  RemoveToolRequest,
  RemoveToolRequestRequest,
  SaveToolCodeRequest,
  SaveToolCodeResponse,
  SearchPromptsResponse,
  SetOAuthTokenRequest,
  SetOAuthTokenResponse,
  ToggleEnableToolRequest,
  ToggleEnableToolResponse,
  UndoToolImplementationRequest,
  UndoToolImplementationResponse,
  UpdatePromptRequest,
  UpdateToolCodeImplementationRequest,
  UpdateToolCodeImplementationResponse,
  UpdateToolRequest,
  UpdateToolResponse,
} from './types';

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

export const toggleEnableTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: ToggleEnableToolRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_tool_enabled'),
    { tool_router_key: payload.tool_router_key, enabled: payload.enabled },
    { headers: { Authorization: `Bearer ${bearerToken}` } },
  );
  return response.data as ToggleEnableToolResponse;
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

export const toolImplementation = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CreateToolCodeRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/tool_implementation'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CreateToolCodeResponse;
};
export const toolMetadataImplementation = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CreateToolMetadataRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/tool_metadata_implementation'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CreateToolMetadataResponse;
};

export const executeToolCode = async (
  nodeAddress: string,
  bearerToken: string,
  payload: ExecuteToolCodeRequest,
  xShinkaiAppId: string,
  xShinkaiToolId: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/code_execution'),
    payload,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'x-shinkai-app-id': xShinkaiAppId,
        'x-shinkai-tool-id': xShinkaiToolId,
      },
      responseType: 'json',
    },
  );
  return response.data as ExecuteToolCodeResponse;
};

export const saveToolCode = async (
  nodeAddress: string,
  bearerToken: string,
  payload: SaveToolCodeRequest,
  xShinkaiAppId: string,
  xShinkaiToolId: string,
  xShinkaiOriginalToolRouterKey?: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_playground_tool'),
    payload,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'x-shinkai-app-id': xShinkaiAppId,
        'x-shinkai-tool-id': xShinkaiToolId,
        ...(xShinkaiOriginalToolRouterKey && {
          'x-shinkai-original-tool-router-key': xShinkaiOriginalToolRouterKey,
        }),
      },
      responseType: 'json',
    },
  );
  return response.data as SaveToolCodeResponse;
};

export const getPlaygroundTools = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_playground_tools'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetPlaygroundToolsResponse;
};

export const getPlaygroundTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetPlaygroundToolRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/get_playground_tool'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { tool_key: payload.tool_key },
      responseType: 'json',
    },
  );
  return response.data as GetPlaygroundToolResponse;
};

export const restoreToolConversation = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UndoToolImplementationRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/tool_implementation_undo_to'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as UndoToolImplementationResponse;
};

export const removeTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemoveToolRequest,
) => {
  const response = await httpClient.delete(
    urlJoin(nodeAddress, '/v2/remove_tool'),
    {
      params: { tool_key: payload.tool_key },
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const removePlaygroundTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemovePlaygroundToolRequest,
) => {
  const response = await httpClient.delete(
    urlJoin(nodeAddress, '/v2/remove_playground_tool'),
    {
      params: { tool_key: payload.tool_key },
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const updateToolCodeImplementation = async (
  nodeAddress: string,
  bearerToken: string,
  payload: UpdateToolCodeImplementationRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/tool_implementation_code_update'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as UpdateToolCodeImplementationResponse;
};

export const openToolInCodeEditor = async (
  nodeAddress: string,
  bearerToken: string,
  payload: OpenToolInCodeEditorRequest,
  xShinkaiAppId: string,
  xShinkaiToolId: string,
  xShinkaiLLMProvider: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/tools_standalone_playground'),
    payload,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'x-shinkai-app-id': xShinkaiAppId,
        'x-shinkai-tool-id': xShinkaiToolId,
        'x-shinkai-llm-provider': xShinkaiLLMProvider,
      },
      responseType: 'json',
    },
  );
  return response.data as OpenToolInCodeEditorResponse;
};
export const duplicateTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: DuplicateToolRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/duplicate_tool'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );

  return response.data as DuplicateToolResponse;
};

export const importTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: ImportToolRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/import_tool'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as ImportToolResponse;
};

export const exportTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: ExportToolRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/export_tool'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { tool_key_path: payload.toolKey },
      responseType: 'blob',
    },
  );
  return response.data as ExportToolResponse;
};

export const getShinkaiFileProtocol = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetShinkaiFileProtocolRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/resolve_shinkai_file_protocol'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      params: { file: payload.file },
      responseType: 'blob',
    },
  );
  return response.data as GetShinkaiFileProtocolResponse;
};

export const setOAuthToken = async (
  nodeAddress: string,
  bearerToken: string,
  payload: SetOAuthTokenRequest,
): Promise<SetOAuthTokenResponse> => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/set_oauth_token'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as SetOAuthTokenResponse;
};

export const getAllToolAssets = async (
  nodeAddress: string,
  bearerToken: string,
  xShinkaiAppId: string,
  xShinkaiToolId: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_tool_asset'),
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'x-shinkai-app-id': xShinkaiAppId,
        'x-shinkai-tool-id': xShinkaiToolId,
      },
      responseType: 'json',
    },
  );
  return response.data as GetAllToolAssetsResponse;
};

export const uploadAssetTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: AddToolRequestRequest,
  xShinkaiAppId: string,
  xShinkaiToolId: string,
) => {
  const fileData = await payload.file.arrayBuffer();

  const formData = new FormData();
  formData.append('file_name', payload.filename);
  formData.append('file', new Blob([fileData]));

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/tool_asset'),
    formData,
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'x-shinkai-app-id': xShinkaiAppId,
        'x-shinkai-tool-id': xShinkaiToolId,
      },
      responseType: 'json',
    },
  );
  return response.data as AddToolRequestResponse;
};

export const uploadAssetsToTool = async (
  nodeAddress: string,
  bearerToken: string,
  xShinkaiAppId: string,
  xShinkaiToolId: string,
  files: File[],
) => {
  for (const file of files) {
    await uploadAssetTool(
      nodeAddress,
      bearerToken,
      {
        filename: encodeURIComponent(file.name),
        file,
      },
      xShinkaiAppId,
      xShinkaiToolId,
    );
  }
  return { success: true };
};

export const removeToolAsset = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemoveToolRequestRequest,
  xShinkaiAppId: string,
  xShinkaiToolId: string,
) => {
  const response = await httpClient.delete(
    urlJoin(nodeAddress, '/v2/tool_asset'),
    {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'x-shinkai-app-id': xShinkaiAppId,
        'x-shinkai-tool-id': xShinkaiToolId,
      },
      params: { file_name: payload.filename },
      responseType: 'json',
    },
  );
  return response.data;
};

export const enableAllTools = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/enable_all_tools'),
    {},
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const disableAllTools = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/disable_all_tools'),
    {},
    { headers: { Authorization: `Bearer ${bearerToken}` } },
  );
  return response.data;
};
export const publishTool = async (
  nodeAddress: string,
  bearerToken: string,
  payload: PublishToolRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/publish_tool'),
    {
      params: { tool_key_path: payload.tool_key_path },
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as PublishToolResponse;
};

export const getToolStoreDetails = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetToolStoreDetailsRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, `/v2/tool_store_proxy/${payload.tool_router_key}`),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetToolStoreDetailsResponse;
};
