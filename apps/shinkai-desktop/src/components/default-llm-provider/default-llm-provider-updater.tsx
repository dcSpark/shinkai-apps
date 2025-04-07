import { useEffect } from 'react';
import { useShinkaiNodeSetDefaultLlmProviderMutation } from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useAuth } from '../../store/auth';

interface DefaultLlmProviderUpdaterProps {
  defaultAgentId: string;
}

/**
 * Component that updates the default LLM provider in the backend.
 * This component doesn't render anything, it just calls the mutation when mounted.
 */
export const DefaultLlmProviderUpdater: React.FC<DefaultLlmProviderUpdaterProps> = ({
  defaultAgentId,
}) => {
  const auth = useAuth((state) => state.auth);
  const { mutate } = useShinkaiNodeSetDefaultLlmProviderMutation({
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
