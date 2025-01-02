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
  MoveFolderRequest,
  MoveFolderResponse,
  MoveFsItemRequest,
  MoveFsItemResponse,
  RemoveFolderRequest,
  RemoveFolderResponse,
  RemoveFsItemRequest,
  RemoveFsItemResponse,
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
