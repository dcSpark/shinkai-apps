import { listen } from '@tauri-apps/api/event';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../store/auth';

export const CONFIG_DEEPLINK_EVENT = 'config-deep-link';
export type ConfigDeepLinkPayload = {
  tool_router_key: string;
};
export const useConfigDeepLink = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    const unlisten = listen(CONFIG_DEEPLINK_EVENT, (event) => {
      if (!auth) return;

      const payload = event.payload as ConfigDeepLinkPayload;
      if (payload.tool_router_key) {
        navigate(`/tools/${payload.tool_router_key}`);
      }
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [auth, navigate]);
};
