import { httpClient } from '../http-client';
import { urlJoin } from '../utils/url-join';

export type ScanOllamaModelsResponse = {
  details: {
    families: string[];
    family: string;
    format: string;
    parameter_size: string;
    parent_model: string;
    quantization_level: string;
  };
  digest: string;
  model: string;
  modified_at: string;
  name: string;
  port_used: string;
  size: number;
}[];

export const scanOllamaModels = async (
  nodeAddress: string,
  bearerToken: string,
) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/scan_ollama_models'),
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data as ScanOllamaModelsResponse;
};

export type AddOllamaModelsRequest = {
  models: string[];
};
export const addOllamaModels = async (
  nodeAddress: string,
  bearerToken: string,
  payload: AddOllamaModelsRequest,
) => {
  const response = await httpClient.post(
    urlJoin(nodeAddress, '/v2/add_ollama_models'),
    payload,
    {
      headers: { Authorization: `Bearer ${bearerToken}` },
      responseType: 'json',
    },
  );
  return response.data;
};
