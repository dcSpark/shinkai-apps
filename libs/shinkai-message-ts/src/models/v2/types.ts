export type CreateJobRequest = {
  llm_provider: string;
  job_creation_info: {
    scope: {
      network_folders: [];
      vector_fs_folders: [];
      vector_fs_items: [];
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
    workflow_code?: string;
    content: string;
    workflow_name?: string;
    job_id: string;
    files_inbox: string;
    parent: string | null;
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
