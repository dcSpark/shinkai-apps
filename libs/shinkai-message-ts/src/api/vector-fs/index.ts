import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import {
  CopyFolderRequest,
  CopyFolderResponse,
  CopyFsItemRequest,
  CopyFsItemResponse,
  CreateFolderRequest,
  CreateFolderResponse,
  GetListDirectoryContentsRequest,
  GetListDirectoryContentsResponse,
  GetSearchDirectoryContentsRequest,
  GetSearchDirectoryContentsResponse,
  GetSearchVectorSearchRequest,
  MoveFolderRequest,
  MoveFolderResponse,
  MoveFsItemRequest,
  MoveFsItemResponse,
  RemoveFolderRequest,
  RemoveFolderResponse,
  RemoveFsItemRequest,
  RemoveFsItemResponse,
  RetrieveFilesForJobRequest,
  RetrieveFilesForJobResponse,
  RetrieveVectorResourceRequest,
} from './types';

export const getListDirectoryContents = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetListDirectoryContentsRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/retrieve_path_simplified'),
    {
      params: payload,
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetListDirectoryContentsResponse;
};

export const getSearchDirectoryContents = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetSearchDirectoryContentsRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/search_files_by_name'),
    {
      params: payload,
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as GetSearchDirectoryContentsResponse;
};

export const createFolder = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CreateFolderRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/create_folder'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CreateFolderResponse;
};
export const copyFolder = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CopyFolderRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/copy_folder'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CopyFolderResponse;
};

export const moveFolder = async (
  nodeAddress: string,
  bearerToken: string,
  payload: MoveFolderRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/move_folder'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as MoveFolderResponse;
};

export const removeFolder = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemoveFolderRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/delete_folder'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as RemoveFolderResponse;
};

export const copyFsItem = async (
  nodeAddress: string,
  bearerToken: string,
  payload: CopyFsItemRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/copy_item'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as CopyFsItemResponse;
};

export const moveFsItem = async (
  nodeAddress: string,
  bearerToken: string,
  payload: MoveFsItemRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/move_item'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as MoveFsItemResponse;
};

export const removeFsItem = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RemoveFsItemRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/delete_item'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as RemoveFsItemResponse;
};

export const retrieveVectorResource = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RetrieveVectorResourceRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/retrieve_vector_resource'),
    {
      params: { path: payload.path },
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const uploadFilesToVR = async (
  nodeAddress: string,
  bearerToken: string,
  destinationPath: string,
  files: File[],
): Promise<{ status: string }> => {
  try {
    for (const fileToUpload of files) {
      const formData = new FormData();
      formData.append('file_data', fileToUpload);
      formData.append('filename', fileToUpload.name);
      formData.append('path', destinationPath);

      const response = await httpClient.post(
        urlJoin(nodeAddress, '/v2/upload_file_to_folder'),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${bearerToken}`,
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`Failed to upload file: ${fileToUpload.name}`);
      }
    }

    return { status: 'success' };
  } catch (error) {
    console.error('Error uploadFilesToVR:', error);
    throw error;
  }
};

export const searchVectorFs = async (
  nodeAddress: string,
  bearerToken: string,
  payload: GetSearchVectorSearchRequest,
) => {
  const response = await httpClient.get(
    // retrieve_vector_search_simplified_json
    urlJoin(nodeAddress, '/v2/search_vector_fs'),
    {
      params: payload,
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};

export const retrieveFilesForJob = async (
  nodeAddress: string,
  bearerToken: string,
  payload: RetrieveFilesForJobRequest,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/retrieve_files_for_job'),
    {
      params: payload,
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as RetrieveFilesForJobResponse;
};
