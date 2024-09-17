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
  // subscriptions
  AvailableSharedItems = 'AvailableSharedItems',
  CreateShareableFolder = 'CreateShareableFolder',
  UnshareFolder = 'UnshareFolder',
  SubscribeToSharedFolder = 'SubscribeToSharedFolder',
  UnsubscribeToSharedFolder = 'UnsubscribeToSharedFolder',
  MySubscriptions = 'MySubscriptions',
  // ollama
  APIScanOllamaModels = 'APIScanOllamaModels',
  APIAddOllamaModels = 'APIAddOllamaModels',
  // ws
  WSMessage = 'WSMessage',
  GetLastNotifications = 'GetLastNotifications',
  // workflows
  SearchWorkflows = 'SearchWorkflows',
  ListWorkflows = 'ListWorkflows',
  AddWorkflow = 'AddWorkflow',
  UpdateWorkflow = 'UpdateWorkflow',
  RemoveWorkflow = 'RemoveWorkflow',
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

export interface LocalScopeVRKaiEntry {
  vrkai: {
    resource: {
      Map: {
        created_datetime: string;
        data_tag_index: Record<string, string>;
        description?: null;
        distribution_info: {
          origin: null;
          release_datetime: null;
        };
        embedding_model_used_string: string;
        embeddings: Record<string, string>;
        keywords: {
          keyword_list?: string[];
          keywords_embedding?: null;
        };
        last_written_datetime: string;
        merkle_root: string;
        metadata_index: {
          index: Record<string, string>;
        };
        name: string;
        node_count: number;
        nodes: Record<string, string>;
        resource_base_type: string;
        resource_embedding: {
          id: string;
          vector?: number[];
        };
        resource_id: string;
        source: string;
      };
    };
    metadata: Record<string, string>;
    resource_id: string;
    source: {
      Standard: {
        FileRef: {
          file_name: string;
          file_type: {
            Document: string;
          };
          original_creation_datetime?: string;
          text_chunking_strategy: string;
        };
      };
    };
  };
}

export interface LocalScopeVRPackEntry {
  vrpack: {
    embedding_models_used: Record<string, string>;
    folder_count: number;
    metadata: Record<string, string>;
    name: string;
    resource: {
      Map: {
        created_datetime: string;
        data_tag_index: Record<string, string>;
        description?: null;
        distribution_info: {
          origin: null;
          release_datetime: null;
        };
        embedding_model_used_string: string;
        embeddings: Record<string, string>;
        keywords: {
          keyword_list?: string[];
          keywords_embedding?: null;
        };
        last_written_datetime: string;
        merkle_root: string;
        metadata_index: {
          index: Record<string, string>;
        };
        name: string;
        node_count: number;
        nodes: Record<string, string>;
        resource_base_type: string;
        resource_embedding: {
          id: string;
          vector?: number[];
        };
        resource_id: string;
        source: string;
      };
    };
    version: string;
    vrkai_count: number;
  };
}

export interface VectorFSItemScopeEntry {
  name: string;
  path: string;
  source: {
    Standard: {
      FileRef: {
        file_name: string;
        file_type: {
          Document: string;
        };
        original_creation_datetime: null;
        text_chunking_strategy: string;
      };
    };
  };
}

export interface VectorFSFolderScopeEntry {
  name: string;
  path: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NetworkFolderScopeEntry {}

export interface JobScope {
  local_vrkai: LocalScopeVRKaiEntry[];
  local_vrpack: LocalScopeVRPackEntry[];
  vector_fs_items: VectorFSItemScopeEntry[];
  vector_fs_folders: VectorFSFolderScopeEntry[];
  network_folders: [];
}

export interface JobCreation {
  scope: JobScope;
}

export interface JobMessage {
  job_id: string;
  content: string;
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
  perform_locally: boolean;
  external_url?: string;
  api_key?: string;
  model: AgentAPIModel;
  toolkit_permissions: string[];
  storage_bucket_permissions: string[];
  allowed_message_senders: string[];
}

export type LLMProvider = {
  id: string;
  full_identity_name: string; // ShinkaiName
  perform_locally: boolean;
  external_url?: string;
  api_key?: string;
  model: string;
  toolkit_permissions: string[];
  storage_bucket_permissions: string[];
  allowed_message_senders: string[];
};
export type AgentAPIModel = {
  OpenAI?: OpenAI;
  GenericAPI?: GenericAPI;
  Ollama?: Ollama;
  Gemini?: Gemini;
  Exo?: Exo;
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

export interface OpenAI {
  model_type: string;
}

export interface GenericAPI {
  model_type: string;
}

export interface Exo {
  model_type: string;
}

export interface APIAddAgentRequest {
  agent: SerializedLLMProvider;
}

export type WorkflowRaw = {
  name: string;
  version: string;
  // steps: Vec<Step>;
  raw: string;
  description?: string;
  author: string;
  sticky: boolean;
};
export type Workflow = {
  author: string;
  config?: string;
  description: string;
  enabled: boolean;
  formatted_tool_summary_for_ui: string;
  name: string;
  tool_router_key: string;
  tool_type: ShinkaiToolType;
  version: string;
};

export type ToolConfig = {
  BasicConfig: {
    description: string;
    key_name: string;
    key_value: string | null;
    required: boolean;
  };
};
export type WorkflowShinkaiTool = {
  workflow: WorkflowRaw;
  embedding: Embedding[];
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
export type ShinkaiToolType = 'JS' | 'Workflow';
export type ShinkaiTool = WorkflowShinkaiTool | JSShinkaiTool;

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
  workflow?: WorkflowRaw;
  workflow_name?: string;
  llm_provider_name: string;
  input_hash?: string;
};
export type ColumnBehavior =
  | ColumnType.Text
  | ColumnType.Number
  | { [ColumnType.Formula]: string }
  | { [ColumnType.UploadedFiles]: { files: string[] } }
  | {
      [ColumnType.LLMCall]: LLMCallPayload;
    }
  | {
      [ColumnType.MultipleVRFiles]: {
        files: [string, string][];
      };
    };

export type Columns = {
  [key: string]: {
    behavior?: ColumnBehavior;
    id: string;
    name: string;
  };
};
