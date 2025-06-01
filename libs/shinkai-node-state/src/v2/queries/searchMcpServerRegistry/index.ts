import type {
  SearchMcpServerRegistryInput,
  SearchMcpServerRegistryResponse,
} from './types';

const AUTH_TOKEN = 'a705894b-10d3-43fd-8540-789434a73b32';

export const searchMcpServerRegistry = async (
  input: SearchMcpServerRegistryInput,
): Promise<SearchMcpServerRegistryResponse> => {
  const { query, page = 1, pageSize = 20 } = input;
  const url = `https://registry.smithery.ai/servers?q=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AUTH_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to search MCP servers: ${response.statusText}`);
  }

  return (await response.json()) as SearchMcpServerRegistryResponse;
};
