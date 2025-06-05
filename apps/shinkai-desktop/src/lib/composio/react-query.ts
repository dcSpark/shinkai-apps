import { useMutation, useQuery } from '@tanstack/react-query';
import { ComposioApi } from './composio-api';
import { McpServerType } from '@shinkai_network/shinkai-message-ts/api/mcp-servers/types';
import { useAddMcpServer } from '@shinkai_network/shinkai-node-state/v2/mutations/addMcpServer/useAddMcpServer';
import { toast } from 'sonner';

const api = new ComposioApi();

// Query keys for caching and invalidation
export const composioKeys = {
  all: ['composio'] as const,
  apps: () => [...composioKeys.all, 'apps'] as const,
  app: (id: string) => [...composioKeys.apps(), id] as const,
};

// Hook to fetch all apps
export const useApps = () => {
  return useQuery({
    queryKey: composioKeys.apps(),
    queryFn: () => api.getApps(),
  });
};

// Hook to fetch a single app by ID
export const useApp = (appId: string) => {
  return useQuery({
    queryKey: composioKeys.app(appId),
    queryFn: () => api.getApp(appId),
    enabled: !!appId, // Only run the query if we have an appId
  });
};

type InstallAppParams = {
  appId: string;
  auth: {
    node_address: string;
    api_v2_key: string;
  };
};

// Mutation to get client ID and install app
export const useInstallApp = () => {
  const { mutateAsync: addMcpServer } = useAddMcpServer({
    onSuccess: () => {
      toast.success("MCP Server added successfully");
    },
    onError: (error) => {
      toast.error("Failed to add MCP server", {
        description: error.message
      });
    }
  });

  return useMutation({
    mutationFn: async ({ appId, auth }: InstallAppParams) => {
      const clientId = await api.generateClientId(appId);
      const data = await api.getAppForClientId(appId, clientId);
      if (data.sseUrl) {
        try {
          await addMcpServer({
            nodeAddress: auth.node_address,
            token: auth.api_v2_key,
            name: data.name,
            type: McpServerType.Sse,
            url: data.sseUrl,
            is_enabled: true
          });
        } catch (error) {
          toast.error("Error adding MCP server");
        }
      } else {
        throw new Error("Composio SSE url not found");
      }
      return data;
    }
  });
};
