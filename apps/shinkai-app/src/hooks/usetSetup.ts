import { ApiConfig } from '@shinkai_network/shinkai-message-ts/api';
import { useEffect } from 'react';

import { useAuth } from '../store/auth';

export const useSetup = () => {
  const auth = useAuth((state) => state.auth);

  useEffect(() => {
    ApiConfig.getInstance().setEndpoint(auth?.node_address ?? '');
  }, [auth?.node_address]);
};
