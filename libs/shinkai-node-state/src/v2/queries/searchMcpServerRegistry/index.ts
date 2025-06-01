import { invoke } from '@tauri-apps/api/tauri';
import type {
  SearchMcpServerRegistryInput,
  SearchMcpServerRegistryResponse,
} from './types';

const AUTH_TOKEN = 'a705894b-10d3-43fd-8540-789434a73b32';

interface FetchResponse {
  status: number;
  headers: Record<string, string[]>;
  body: string;
}

export const searchMcpServerRegistry = async (
  input: SearchMcpServerRegistryInput,
): Promise<SearchMcpServerRegistryResponse> => {
  const { query, page = 1, pageSize = 20 } = input;
  const url = `https://registry.smithery.ai/servers?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`;

  const response = await invoke<FetchResponse>('get_request', {
    url,
    customHeaders: JSON.stringify({
      Authorization: `Bearer ${AUTH_TOKEN}`,
    }),
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(`Failed to search MCP servers: ${response.status}`);
  }

  return JSON.parse(response.body) as SearchMcpServerRegistryResponse;
};
