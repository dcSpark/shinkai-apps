export type RetrieveSourceFileRequest = {
  path: string;
};

export type RetrieveSourceFileResponse = string;

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
