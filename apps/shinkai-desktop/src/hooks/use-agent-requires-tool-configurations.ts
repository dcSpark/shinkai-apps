import { Agent } from '@shinkai_network/shinkai-message-ts/api/agents/types';
import { useGetTools } from '@shinkai_network/shinkai-node-state/v2/queries/getToolsList/useGetToolsList';
import { useMemo } from 'react';

import { useAuth } from '../store/auth';
import { getToolRequiresConfigurations } from '../utils/tools-configurations';

/**
 * Hook to check if an agent requires tool configurations
 * @param agent - The agent to check
 * @returns Object containing loading state and whether the agent requires tool configurations
 */
export function useAgentRequiresToolConfigurations(agent: Agent | undefined) {
  const auth = useAuth((state) => state.auth);

  const { data: toolsList, isLoading: isGetToolsLoading } = useGetTools({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const isLoading = useMemo(() => {
    if (!agent) return false;
    return isGetToolsLoading;
  }, [agent, isGetToolsLoading]);

  const requiresConfiguration = useMemo(() => {
    if (!agent) {
      return false;
    }
    if (!toolsList || isLoading) return false;
    const agentTools = toolsList.filter((tool) =>
      agent.tools.includes(tool.tool_router_key),
    );
    // Check if any tool requires configuration
    const hasToolsRequiringConfig = agentTools.some((tool) =>
      getToolRequiresConfigurations(tool?.config ?? []),
    );
    return hasToolsRequiringConfig;
  }, [agent, toolsList, isLoading]);

  return {
    isLoading,
    requiresConfiguration,
  };
}
