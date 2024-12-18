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
      oauthModalVisible: true,
      provider: 'github',
      url: 'https://github.com/login/oauth/authorize?client_id=Ov23liXMvcIH8Wu38M3F&redirect_uri=https%3A%2F%2Fsecrets.shinkai.com%2Fredirect&scope=user&state=91891bc3-f989-4387-b6b9-0ba30da170d7',
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
