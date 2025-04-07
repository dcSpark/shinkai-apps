import { useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../store/auth';
import { shinkaiNodeSetDefaultLlmProvider } from '../../lib/shinkai-node-manager/shinkai-node-manager-client';

interface DefaultLlmProviderUpdaterProps {
  defaultAgentId: string;
}

/**
 * Component that updates the default LLM provider in the backend.
 * This component doesn't render anything, it just calls the API endpoint when mounted.
 */
export const DefaultLlmProviderUpdater: React.FC<DefaultLlmProviderUpdaterProps> = ({
  defaultAgentId,
}) => {
  const auth = useAuth((state) => state.auth);
  
  const { mutate } = useMutation({
    mutationFn: async (llmProvider: string) => {
      if (!auth?.node_address || !auth?.api_v2_key) {
        throw new Error('Node address and API key are required');
      }
      return shinkaiNodeSetDefaultLlmProvider(
        llmProvider,
        auth.node_address,
        auth.api_v2_key
      );
    },
    onError: (error) => {
      console.error('Failed to set default LLM provider:', error);
    },
  });

  useEffect(() => {
    if (auth?.node_address && auth?.api_v2_key && defaultAgentId) {
      mutate(defaultAgentId);
    }
  }, [auth, defaultAgentId, mutate]);

  return null;
};

export default DefaultLlmProviderUpdater;
