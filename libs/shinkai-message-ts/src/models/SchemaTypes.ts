import { WasmEncryptionMethod } from '../pkg/shinkai_message_wasm';

export const TSEncryptionMethod = {
  DiffieHellmanChaChaPoly1305:
    WasmEncryptionMethod.DiffieHellmanChaChaPoly1305(),
  None: WasmEncryptionMethod.None(),
};

export enum MessageSchemaType {
  JobCreationSchema = 'JobCreationSchema',
  JobMessageSchema = 'JobMessageSchema',
  PreMessageSchema = 'PreMessageSchema',
  CreateRegistrationCode = 'CreateRegistrationCode',
  UseRegistrationCode = 'UseRegistrationCode',
  APIGetMessagesFromInboxRequest = 'APIGetMessagesFromInboxRequest',
  APIReadUpToTimeRequest = 'APIReadUpToTimeRequest',
  APIAddAgentRequest = 'APIAddAgentRequest',
  APIModifyAgentRequest = 'APIModifyAgentRequest',
  APIRemoveAgentRequest = 'APIRemoveAgentRequest',
  TextContent = 'TextContent',
  SymmetricKeyExchange = 'SymmetricKeyExchange',
  APIFinishJob = 'APIFinishJob',
  ChangeJobAgentRequest = 'ChangeJobAgentRequest',
  Empty = '',
  ChangeNodesName = 'ChangeNodesName',
  VecFsRetrievePathSimplifiedJson = 'VecFsRetrievePathSimplifiedJson',
  VecFsRetrieveVectorResource = 'VecFsRetrieveVectorResource',
  VecFsRetrieveVectorSearchSimplifiedJson = 'VecFsRetrieveVectorSearchSimplifiedJson',
  VecFsCreateFolder = 'VecFsCreateFolder',
  VecFsDeleteFolder = 'VecFsDeleteFolder',
  VecFsMoveFolder = 'VecFsMoveFolder',
  VecFsCopyFolder = 'VecFsCopyFolder',
  VecFsCreateItem = 'VecFsCreateItem',
  VecFsMoveItem = 'VecFsMoveItem',
  VecFsCopyItem = 'VecFsCopyItem',
  VecFsDeleteItem = 'VecFsDeleteItem',
  ConvertFilesAndSaveToFolder = 'ConvertFilesAndSaveToFolder',
  VecFsSearchItems = 'VecFsSearchItems',
  VecFsRetrieveVRPack = 'VecFsRetrieveVRPack',

  // ollama
  APIScanOllamaModels = 'APIScanOllamaModels',
  APIAddOllamaModels = 'APIAddOllamaModels',
  // ws
  WSMessage = 'WSMessage',
  GetLastNotifications = 'GetLastNotifications',
  // sheet
  UserSheets = 'UserSheets',
  SetColumn = 'SetColumn',
  RemoveColumn = 'RemoveColumn',
  RemoveSheet = 'RemoveSheet',
  CreateEmptySheet = 'CreateEmptySheet',
  SetCellValue = 'SetCellValue',
  GetSheet = 'GetSheet',
  AddRows = 'AddRows',
  RemoveRows = 'RemoveRows',
  // tools
  ListAllShinkaiTools = 'ListAllShinkaiTools',
  GetShinkaiTool = 'GetShinkaiTool',
  SetShinkaiTool = 'SetShinkaiTool',
  SearchShinkaiTool = 'SearchShinkaiTool',
}

export interface JobToolCall {
  tool_id: string;
  inputs: Record<string, string>;
}

export enum JobRecipient {
  SelfNode = 'SelfNode',
  User = 'User',
  ExternalIdentity = 'ExternalIdentity',
}

export interface JobPreMessage {
  tool_calls: JobToolCall[];
  content: string;
  recipient: JobRecipient;
}

export interface APIGetMessagesFromInboxRequest {
  inbox: string;
  count: number;
  offset?: string;
}

export interface APIReadUpToTimeRequest {
  inbox_name: string;
  up_to_time: string;
}

export interface SerializedLLMProvider {
  id: string;
  full_identity_name: string; // ShinkaiName
  external_url?: string;
  api_key?: string;
  model: AgentAPIModel;
}

export type LLMProvider = {
  id: string;
  full_identity_name: string; // ShinkaiName
  external_url?: string;
  api_key?: string;
  model: string;
  name?: string;
  description?: string;
};
export type AgentAPIModel = {
  OpenAI?: OpenAI;
  TogetherAI?: TogetherAI;
  Groq?: Groq;
  OpenRouter?: OpenRouter;
  Ollama?: Ollama;
  Gemini?: Gemini;
  Exo?: Exo;
  Claude?: Claude;
  DeepSeek?: DeepSeek;
} & {
  [model: string]: ModelType;
};

export interface ModelType {
  model_type: string;
}

export interface Ollama {
  model_type: string;
}
export interface Gemini {
  model_type: string;
}

export interface Groq {
  model_type: string;
}

export interface OpenRouter {
  model_type: string;
}

export interface OpenAI {
  model_type: string;
}

export interface TogetherAI {
  model_type: string;
}

export interface Exo {
  model_type: string;
}

export interface Claude {
  model_type: string;
}

export interface DeepSeek {
  model_type: string;
}

export interface APIAddAgentRequest {
  agent: SerializedLLMProvider;
}

export type ToolConfig = {
  BasicConfig: {
    description: string;
    key_name: string;
    key_value: string | null;
    required: boolean;
  };
};
export type ToolArgument = {
  name: string;
  arg_type: string;
  description: string;
  is_required: boolean;
};

type Embedding = {
  id: string;
  vector: number[];
};

type JSToolResult = {
  result_type: string;
  properties: Record<string, string>;
  required: string[];
};
export type JSShinkaiTool = {
  toolkit_name: string;
  name: string;
  author: string;
  js_code: string;
  config: ToolConfig[];
  description: string;
  keywords: string[];
  input_args: ToolArgument[];
  config_set: boolean;
  activated: boolean;
  embedding?: Embedding;
  result: JSToolResult;
};
export type ShinkaiToolType = 'JS';
export type ShinkaiTool = JSShinkaiTool;

export enum ColumnType {
  Text = 'Text',
  Number = 'Number',
  Formula = 'Formula',
  UploadedFiles = 'UploadedFiles',
  LLMCall = 'LLMCall',
  MultipleVRFiles = 'MultipleVRFiles',
}
export enum ColumnStatus {
  Ready = 'Ready',
  Pending = 'Pending',
  Error = 'Error',
}
export type LLMCallPayload = {
  input: string;
  llm_provider_name: string;
  input_hash?: string;
};
export type ColumnBehavior =
  | ColumnType.Text
  | ColumnType.Number
  | { [ColumnType.Formula]: string }
  | {
      [ColumnType.LLMCall]: LLMCallPayload;
    }
  | ColumnType.MultipleVRFiles
  | { [ColumnType.UploadedFiles]: { fileInboxId: string } };

export type Columns = {
  [key: string]: {
    behavior?: ColumnBehavior;
    id: string;
    name: string;
  };
};

export interface VectorFSItemScopeEntry {
  name: string;
  source: string;
  path: string;
  vr_header: {
    resource_name: string;
    resource_source: string;
  };
}

export interface VectorFSFolderScopeEntry {
  name: string;
  path: string;
}
