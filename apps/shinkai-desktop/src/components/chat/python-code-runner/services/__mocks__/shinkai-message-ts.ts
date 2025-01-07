export interface AddFileToJobRequest {
  job_id: string;
  filename: string;
  file: File;
}

export interface AddFileToInboxResponse {
  message: string;
  filename: string;
}

export interface DirectoryContent {
  name: string;
  path: string;
  is_directory: boolean;
  children: DirectoryContent[] | null;
  created_time: string;
  modified_time: string;
  has_embeddings: boolean;
  size: number;
} 