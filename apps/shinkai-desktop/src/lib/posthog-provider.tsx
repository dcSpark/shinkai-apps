import { PostHogProvider, usePostHog } from 'posthog-js/react';
import { useEffect } from 'react';

import { useSettings } from '../store/settings';

export const AnalyticsEvents = {
  chatWithFiles: 'chat_with_files',
  UploadFiles: 'upload_files',
} as const;

const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  const optInAnalytics = useSettings((state) => state.optInAnalytics);
  const posthog = usePostHog();

  const posthogHost = import.meta.env.VITE_POSTHOG_HOST;
  const posthogApiKey = import.meta.env.VITE_POSTHOG_API_KEY;

  const options = {
    api_host: import.meta.env.VITE_POSTHOG_HOST,
    // default `false`, make sure we do not capture sensitive info
    disable_session_recording: true,
    autocapture: false,
    loaded: () => {
      if (import.meta.env.DEV) posthog.debug();
    },
    opt_out_capturing_by_default: false,
    debug: true,
  };

  useEffect(() => {
    if (optInAnalytics) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  }, [optInAnalytics, posthog]);

  return optInAnalytics && posthogHost && posthogApiKey ? (
    <PostHogProvider
      apiKey={import.meta.env.VITE_POSTHOG_API_KEY}
      options={options}
    >
      {children}
    </PostHogProvider>
  ) : (
    children
  );
};
export default AnalyticsProvider;
