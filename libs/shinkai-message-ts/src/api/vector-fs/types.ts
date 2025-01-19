export type GetListDirectoryContentsRequest = {
  path: string;
  depth?: number;
};

export type DirectoryContent = {
  children: null | DirectoryContent[];
  created_time: string;
  has_embeddings: boolean;
  is_directory: boolean;
  modified_time: string;
  name: string;
  path: string;
  size: number;
};

export type GetListDirectoryContentsResponse = DirectoryContent[];
export type GetSearchDirectoryContentsRequest = {
  name: string;
};
export type GetSearchDirectoryContentsResponse = DirectoryContent[];
export type MoveFolderRequest = {
  origin_path: string;
  destination_path: string;
};
export type MoveFolderResponse = string;

export type MoveFsItemRequest = {
  origin_path: string;
  destination_path: string;
};
export type MoveFsItemResponse = string;

export type CreateFolderRequest = {
  path: string;
  folder_name: string;
};
export type CreateFolderResponse = string;

export type CopyFolderRequest = {
  origin_path: string;
  destination_path: string;
};
export type CopyFolderResponse = string;

export type CopyFsItemRequest = {
  origin_path: string;
  destination_path: string;
};
export type CopyFsItemResponse = string;

export type RemoveFolderRequest = {
  path: string;
};
export type RemoveFolderResponse = string;
export type RemoveFsItemRequest = {
  path: string;
};
export type RemoveFsItemResponse = string;

export interface RetrieveFilesForJobRequest {
  job_id: string;
}

export type RetrieveFilesForJobResponse = DirectoryContent[];
