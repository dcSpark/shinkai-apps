import { JobScope } from '../../models/SchemaTypes';
import { AgentInbox } from '../../models/ShinkaiMessage';

type ResourceSource = {
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

type ResourceKeywords = {
  keyword_list: string[];
  keywords_embedding: null;
};

type VRHeader = {
  resource_name: string;
  resource_id: string;
  resource_base_type: 'Document';
  resource_source: ResourceSource;
  resource_embedding: null;
  resource_created_datetime: Date;
  resource_last_written_datetime: Date;
  resource_embedding_model_used: {
    TextEmbeddingsInference: string;
  };
  resource_merkle_root: string;
  resource_keywords: ResourceKeywords;
  data_tag_names: string[];
  metadata_index_keys: string[];
};

export type VRItem = {
  name: string;
  path: string;
  vr_header: VRHeader;
  created_datetime: Date;
  last_written_datetime: Date;
  last_read_datetime: Date;
  vr_last_saved_datetime: Date;
  source_file_map_last_saved_datetime: Date;
  distribution_origin: null;
  vr_size: number;
  source_file_map_size: number;
  merkle_hash: string;
};

export type VRFolder = {
  path: string;
  child_folders: VRFolder[];
  child_items: Array<VRItem>;
  created_datetime: Date;
  last_written_datetime: Date;
  merkle_root: string;
  last_modified_datetime: Date;
  last_read_datetime: Date;
  merkle_hash: string;
  name: string;
};

export type VRFolderScope = Pick<VRFolder, 'name' | 'path'>;
export type VRItemScope = Pick<VRItem, 'name' | 'path'> & {
  source: ResourceSource;
};

export type CreateJobRequest = {
  llm_provider: string;
  job_creation_info: {
    scope: {
      network_folders: [];
      vector_fs_folders: VRFolderScope[];
      vector_fs_items: VRItemScope[];
      local_vrpack: [];
      local_vrkai: [];
    };
    associated_ui: {
      Sheet: string;
    } | null;
    is_hidden: boolean;
  };
};
export type CreateJobResponse = {
  job_id: string;
};

export type JobMessageRequest = {
  job_message: {
    job_id: string;
    content: string;
    files_inbox: string;
    parent: string | null;
    workflow_code?: string;
    workflow_name?: string;
  };
};
export type JobMessageResponse = {
  inbox: string;
  message_id: string;
  parent_message_id: string;
  scheduled_time: string;
};

export type GetLastMessagesRequest = {
  inbox_name: string;
  limit: number;
  offset_key?: string;
};
export type GetLastMessagesWithBranchesRequest = {
  inbox_name: string;
  limit: number;
  offset_key?: string;
};
export type NodeApiData = {
  node_message_hash: string;
  node_timestamp: string;
  parent_hash: string;
};

export type JobMessage = {
  callback: null;
  content: string;
  files_inbox: string;
  job_id: string;
  parent: string;
  sheet_job_data: null;
  workflow_code: null;
  workflow_name: string;
};
export type ChatMessage = {
  job_message: JobMessage;
  sender: string;
  sender_subidentity: string;
  receiver: string;
  receiver_subidentity: string;
  node_api_data: NodeApiData;
  inbox: string;
};
export type GetLastMessagesResponse = ChatMessage[];
export type GetLastMessagesWithBranchesResponse = ChatMessage[][];
export type CreateFilesInboxResponse = string;
export type AddFileToInboxRequest = {
  file_inbox_name: string;
  filename: string;
  file: File;
};
export type AddFileToInboxResponse = string;

export type LLMProvider = {
  id: string;
  full_identity_name: string;
  perform_locally: boolean;
  external_url?: string;
  api_key?: string;
  model: string;
  toolkit_permissions: string[];
  storage_bucket_permissions: string[];
  allowed_message_senders: string[];
};

export type GetLLMProvidersResponse = LLMProvider[];

export type LLMProviderInterface = {
  OpenAI?: OpenAI;
  TogetherAI?: TogetherAI;
  Ollama?: Ollama;
  Gemini?: Gemini;
  Exo?: Exo;
  Groq?: Groq;
  OpenRouter?: OpenRouter;
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

export type SerializedLLMProvider = {
  id: string;
  full_identity_name: string;
  perform_locally: boolean;
  external_url?: string;
  api_key?: string;
  model: LLMProviderInterface;
  toolkit_permissions: string[];
  storage_bucket_permissions: string[];
  allowed_message_senders: string[];
};
export type AddLLMProviderRequest = SerializedLLMProvider;
export type AddLLMProviderResponse = string;

export type UpdateLLMProviderRequest = SerializedLLMProvider;
export type UpdateLLMProviderResponse = string;

export type RemoveLLMProviderRequest = {
  llm_provider_id: string;
};
export type Inbox = {
  inbox_id: string;
  custom_name: string;
  last_message?: ChatMessage;
  is_finished: boolean;
  job_scope?: JobScope;
  agent?: AgentInbox;
  datetime_created: string;
};
export type GetAllInboxesResponse = Inbox[];

export type GetFileNamesRequest = {
  inboxName: string;
};

export type GetFileNamesResponse = string[];

export type JobConfig = {
  custom_prompt: string;
  temperature?: number;
  seed?: number;
  top_k?: number;
  top_p?: number;
  stream?: boolean;
  other_model_params?: Record<string, string>;
};
export type GetChatConfigRequest = {
  job_id: string;
};
export type GetChatConfigResponse = JobConfig;
export type UpdateChatConfigRequest = {
  job_id: string;
  config: JobConfig;
};
export type UpdateChatConfigResponse = {
  result: string;
};

export type StopGeneratingLLMRequest = string;
export type StopGeneratingLLMResponse = { status: string };

export type GetJobScopeRequest = {
  jobId: string;
};
export type GetJobScopeResponse = JobScope;

export type UpdateJobScopeRequest = {
  job_id: string;
  job_scope: JobScope;
};
export type UpdateJobScopeResponse = string;

export type RetryMessageRequest = {
  message_id: string;
  inbox_name: string;
};
