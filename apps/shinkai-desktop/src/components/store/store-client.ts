import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

export const storeKeys = {
  all: ['store'] as const,
  agents: () => [...storeKeys.all, 'agents'] as const,
};

export interface StoreProduct {
  id: string;
  name: string;
  author: string;
  description: string;
  routerKey: string;
  downloads: number;
  icon_url: string;
  category: {
    id: string;
    name: string;
    description: string;
    examples: string;
  };
}

export type FormattedStoreAgent = {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: number;
  iconUrl: string;
  routerKey: string;
  category: {
    id: string;
    name: string;
    description: string;
    examples: string;
  };
};

export type UseGetStoreAgents = ReturnType<typeof storeKeys.agents>;
export type GetStoreAgentsOutput = FormattedStoreAgent[];

export type UseGetStoreAgentsOptions = QueryObserverOptions<
  GetStoreAgentsOutput,
  Error,
  GetStoreAgentsOutput,
  GetStoreAgentsOutput,
  UseGetStoreAgents
>;

const getStoreAgents = async (): Promise<FormattedStoreAgent[]> => {
  const res = await invoke<{
    status: number;
    headers: Record<string, string[]>;
    body: string;
  }>('get_request', {
    url: 'https://store-api.shinkai.com/store/products?page=1&limit=10&sort=newest&type=agent',
    customHeaders: JSON.stringify({}),
  });

  if (res.status !== 200) {
    throw new Error(`Request failed: ${res.status}`);
  }

  const data = JSON.parse(res.body) as { products: StoreProduct[] };

  return data.products.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    author: item.author,
    downloads: item.downloads,
    iconUrl: item.icon_url,
    routerKey: item.routerKey,
    category: item.category,
  }));
};

export const useGetStoreAgents = (
  options?: Omit<UseGetStoreAgentsOptions, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: storeKeys.agents(),
    queryFn: () => getStoreAgents(),
    ...options,
  });
};
