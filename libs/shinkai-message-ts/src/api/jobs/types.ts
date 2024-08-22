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
    };
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
export type GetLastMessagesResponse = {
  inbox: string;
  job_message: {
    callback: null;
    content: string;
    files_inbox: string;
    job_id: string;
    parent: string;
    sheet_job_data: null;
    workflow_code: null;
    workflow_name: string;
  };
  node_api_data: {
    node_message_hash: string;
    node_timestamp: string;
    parent_hash: string;
  };
  receiver: string;
  receiver_subidentity: string;
  sender: string;
  sender_subidentity: string;
}[];
export type CreateFilesInboxResponse = string;
export type AddFileToInboxRequest = {
  file_inbox_name: string;
  filename: string;
  file: File;
};
export type AddFileToInboxResponse = string;

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

export type GetLLMProvidersResponse = LLMProvider[];
