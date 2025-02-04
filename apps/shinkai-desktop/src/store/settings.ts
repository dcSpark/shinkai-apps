import { LocaleMode, switchLanguage } from '@shinkai_network/shinkai-i18n';
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export enum TutorialBanner {
  SHINKAI_TOOLS = 'shinkai-tools',
  FILES_EXPLORER = 'files-explorer',
  SCHEDULED_TASKS = 'scheduled-tasks',
  AIS_AND_AGENTS = 'ais-and-agents',
}

type SettingsStore = {
  defaultAgentId: string;
  setDefaultAgentId: (defaultAgentId: string) => void;
  defaultSpotlightAiId: string;
  setDefaultSpotlightAiId: (defaultSpotlightAiId: string) => void;
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
  isChatSidebarCollapsed: boolean;
  setChatSidebarCollapsed: (isChatSidebarCollapsed: boolean) => void;
  resetSettings: () => void;
  dismissedTutorialBanners: TutorialBanner[];
  dismissTutorialBanner: (bannerId: TutorialBanner) => void;
};

export const useSettings = create<SettingsStore>()(
  devtools(
    persist(
      (set, get) => ({
        defaultAgentId: '',
        setDefaultAgentId: (defaultAgentId) => {
          set({ defaultAgentId });
        },

        defaultSpotlightAiId: '',
        setDefaultSpotlightAiId: (defaultSpotlightAiId) => {
          set({ defaultSpotlightAiId });
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

        isChatSidebarCollapsed: false,
        setChatSidebarCollapsed: (isChatSidebarCollapsed) => {
          set({ isChatSidebarCollapsed });
        },
        dismissedTutorialBanners: [] as TutorialBanner[],
        dismissTutorialBanner: (bannerId: TutorialBanner) => {
          set((state) => ({
            dismissedTutorialBanners: Array.from(
              new Set([...state.dismissedTutorialBanners, bannerId]),
            ),
          }));
        },

        resetSettings: () => {
          set({
            defaultAgentId: '',
            defaultSpotlightAiId: '',
            // sidebarExpanded: false,
            // isGetStartedChecklistHidden: false,
            // termsAndConditionsAccepted: undefined,
            // optInAnalytics: undefined,
            // optInExperimental: false,
            // userLanguage: 'auto',
            // evmAddress: '',
            // heightRow: 'large',
            // compatibilityBannerDismissed: false,
            // isChatSidebarCollapsed: false,
          });
        },
      }),
      {
        name: 'settings',
      },
    ),
  ),
);
