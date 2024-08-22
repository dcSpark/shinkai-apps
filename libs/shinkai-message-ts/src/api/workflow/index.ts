import { httpClient } from '../../http-client';
import { urlJoin } from '../../utils/url-join';
import { BEARER_TOKEN } from '../constants';
import { ListAllWorkflowsResponse, SearchWorkflowsResponse } from './types';

export const listAllWorkflows = async (nodeAddress: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/list_all_workflows'),
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      responseType: 'json',
    },
  );
  return response.data as ListAllWorkflowsResponse;
};
export const searchWorkflows = async (nodeAddress: string, query: string) => {
  const response = await httpClient.get(
    urlJoin(nodeAddress, '/v2/search_workflows'),
    {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` },
      params: { query },
      responseType: 'json',
    },
  );
  return response.data as SearchWorkflowsResponse;
};
