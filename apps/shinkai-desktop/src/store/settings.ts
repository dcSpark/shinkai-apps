import { LocaleMode, switchLanguage } from '@shinkai_network/shinkai-i18n';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { SetupData, useAuth } from './auth';

type SettingsStore = {
  defaultAgentId: string;
  setDefaultAgentId: (defaultAgentId: string) => void;
  sidebarExpanded: boolean;
  toggleSidebar: () => void;
  isGetStartedChecklistHidden: boolean;
  setGetStartedChecklistHidden: (isGetStartedChecklistHidden: boolean) => void;
  termsAndConditionsAccepted?: boolean;
  setTermsAndConditionsAccepted: (termsAndConditionsAccepted: boolean) => void;
  optInAnalytics?: boolean;
  acceptAnalytics: () => void;
  denyAnalytics: () => void;
  optInExperimental?: boolean;
  setOptInExperimental: (optInExperimental: boolean) => void;
  userLanguage: LocaleMode;
  setUserLanguage: (userLanguage: LocaleMode) => void;
  evmAddress: string;
  setEvmAddress: (evmAddress: string) => void;
  heightRow: 'small' | 'medium' | 'large' | 'extra-large';
  setHeightRow: (height: 'small' | 'medium' | 'large' | 'extra-large') => void;
  compatibilityBannerDismissed: boolean;
  setCompatibilityBannerDismissed: (dismissed: boolean) => void;
};

export const useSettings = create<SettingsStore>()(
  devtools(
    persist(
      (set) => ({
        defaultAgentId: '',
        setDefaultAgentId: (defaultAgentId) => {
          set({ defaultAgentId });
        },

        sidebarExpanded: false,
        toggleSidebar: () => {
          set((state) => ({ sidebarExpanded: !state.sidebarExpanded }));
        },

        isGetStartedChecklistHidden: false,
        setGetStartedChecklistHidden: (isGetStartedChecklistHidden) => {
          set({ isGetStartedChecklistHidden });
        },

        termsAndConditionsAccepted: undefined,
        setTermsAndConditionsAccepted: (termsAndConditionsAccepted) => {
          set({ termsAndConditionsAccepted });
        },

        optInAnalytics: undefined,
        acceptAnalytics: () => {
          set({ optInAnalytics: true });
        },
        denyAnalytics: () => {
          set({ optInAnalytics: false });
        },

        optInExperimental: false,
        setOptInExperimental: (optInExperimental) => {
          set({ optInExperimental });
        },

        userLanguage: 'auto',
        setUserLanguage: (userLanguage) => {
          set({ userLanguage });
          switchLanguage(userLanguage);
        },

        evmAddress: '',
        setEvmAddress: (evmAddress) => {
          set({ evmAddress });
        },

        heightRow: 'large',
        setHeightRow: (heightRow) => {
          set({ heightRow });
        },

        compatibilityBannerDismissed: false,
        setCompatibilityBannerDismissed: (dismissed) => {
          set({ compatibilityBannerDismissed: dismissed });
        },
      }),
      {
        name: 'settings',
      },
    ),
  ),
);

useAuth.subscribe((state, prevState) => {
  handleAuthSideEffect(state.auth, prevState.auth);
});

const handleAuthSideEffect = async (
  auth: SetupData | null,
  prevAuth: SetupData | null,
) => {
  // SignOut case
  if (prevAuth && !auth) {
    useSettings.getState().setDefaultAgentId('');
    return;
  }
};
