/* eslint-disable @typescript-eslint/no-explicit-any */
import { httpClient } from '../http-client';
import { CredentialsPayload } from '../models';
import { urlJoin } from '../utils/url-join';
import { ShinkaiMessageBuilderWrapper } from '../wasm/ShinkaiMessageBuilderWrapper';

export const scanOllamaModels = async (
  nodeAddress: string,
  sender_subidentity: string,
  node_name: string,
  setupDetailsState: CredentialsPayload,
): Promise<{ model: string }[]> => {
  const messageStr = ShinkaiMessageBuilderWrapper.scanOllamaModels(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    node_name,
    sender_subidentity,
    node_name,
    '',
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/scan_ollama_models'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};

export const addOllamaModels = async (
  nodeAddress: string,
  senderSubidentity: string,
  nodeName: string,
  setupDetailsState: CredentialsPayload,
  payload: { models: string[] },
) => {
  const messageStr = ShinkaiMessageBuilderWrapper.addOllamaModels(
    setupDetailsState.profile_encryption_sk,
    setupDetailsState.profile_identity_sk,
    setupDetailsState.node_encryption_pk,
    nodeName,
    senderSubidentity,
    nodeName,
    senderSubidentity,
    payload,
  );

  const message = JSON.parse(messageStr);

  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v1/add_ollama_models'),
    message,

    {
      responseType: 'json',
    },
  );
  const data = response.data;
  return data;
};
