import { type NetworkToolWithOffering } from '@shinkai_network/shinkai-message-ts/api/tools/types';
import { type QueryObserverOptions, useQuery } from '@tanstack/react-query';
import { invoke } from '@tauri-apps/api/core';

import { type FormattedNetworkAgent } from './types';

export const networkKeys = {
  all: ['network'] as const,
  agents: () => [...networkKeys.all, 'agents'] as const,
  installedAgents: () => [...networkKeys.all, 'installed_agents'] as const,
};

export type UseGetNetworkAgents = ReturnType<typeof networkKeys.agents>;
export type GetNetworkAgentsOutput = FormattedNetworkAgent[];

export type UseGetNetworkAgentsOptions = QueryObserverOptions<
  GetNetworkAgentsOutput,
  Error,
  GetNetworkAgentsOutput,
  GetNetworkAgentsOutput,
  UseGetNetworkAgents
>;

const getNetworkAgents = async (): Promise<FormattedNetworkAgent[]> => {
  const res = await invoke<{
    status: number;
    headers: Record<string, string[]>;
    body: string;
  }>('get_request', {
    url: 'https://storage.googleapis.com/network-agents/all_agents.json',
    customHeaders: JSON.stringify({}),
  });
  if (res.status !== 200) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const data = JSON.parse(res.body) as NetworkToolWithOffering[];

  return data.map((item, idx) => {
    const usage =
      item.network_tool?.usage_type ?? item.tool_offering?.usage_type;

    const payment =
      usage?.PerUse &&
      typeof usage.PerUse === 'object' &&
      'Payment' in usage.PerUse
        ? usage.PerUse.Payment?.[0]
        : undefined;

    let price = 'Free';
    if (payment?.maxAmountRequired) {
      const currency = payment.extra?.name ?? '';
      price = `${payment.maxAmountRequired} ${currency}`.trim();
    }

    return {
      id: item.network_tool?.tool_router_key ?? String(idx),
      name: item.network_tool?.name ?? 'Unknown',
      description: item.network_tool?.description ?? '',
      price,
      category: item.tool_offering?.meta_description ?? 'Network Agent',
      provider: item.network_tool?.provider ?? item.network_tool?.author ?? '',
      toolRouterKey: item.network_tool?.tool_router_key ?? '',
      apiData: item,
    };
  });
};

export const useGetNetworkAgents = (
  options?: Omit<UseGetNetworkAgentsOptions, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: networkKeys.agents(),
    queryFn: () => getNetworkAgents(),
    ...options,
  });
};
