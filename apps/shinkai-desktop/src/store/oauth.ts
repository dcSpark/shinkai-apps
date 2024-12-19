import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type OAuthStore = {
  oauthModalVisible: boolean;
  url?: string;
  setOauthModalVisible: (
    options:
      | {
          visible: true;
          url: string;
        }
      | { visible: false },
  ) => void;
};

export const useOAuth = create<OAuthStore>()(
  devtools(
    (set) => ({
      oauthModalVisible: false,
      provider: 'github',
      url: undefined,
      setOauthModalVisible: (options) => {
        if (options.visible) {
          set({
            oauthModalVisible: true,
            url: options.url,
          });
        } else {
          set({
            oauthModalVisible: false,
            url: undefined,
          });
        }
      },
    }),
    {
      name: 'oauth',
    },
  ),
);
