import { getNetworkAgents as getNetworkAgentsApi } from '@shinkai_network/shinkai-message-ts/api/tools/index';

export const getNetworkAgents = async () => {
  const response = await getNetworkAgentsApi();
  const formattedResponse = response.map((item, idx) => {
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
      node: item.node,
    };
  });
  return formattedResponse;
};
