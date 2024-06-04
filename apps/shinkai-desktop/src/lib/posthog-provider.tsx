import { PostHogProvider, usePostHog } from 'posthog-js/react';
import React, { useEffect } from 'react';

import { useSettings } from '../store/settings';

export const AnalyticsEvents = {
  chatWithFiles: 'chat_with_files',
  UploadFiles: 'upload_files',
} as const;

export const AnalyticsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
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

export type AnalyticEventName =
  | 'AI Chat'
  | 'AI Chat with Files'
  | 'Upload Files'
  | 'Ask Local Files';

export type AnalyticEventProps<TEventName extends AnalyticEventName> =
  TEventName extends 'AI Chat'
    ? undefined
    : TEventName extends 'AI Chat with Files'
      ? {
          filesCount: number;
        }
      : TEventName extends 'Upload Files'
        ? {
            filesCount: number;
          }
        : TEventName extends 'Ask Local Files'
          ? {
              foldersCount: number;
              filesCount: number;
            }
          : undefined;

export const useAnalytics = () => {
  const posthog = usePostHog();

  function captureAnalyticEvent<TEventName extends AnalyticEventName>(
    eventName: TEventName,
    eventProps: AnalyticEventProps<TEventName>,
  ) {
    // Only send analytic events on production
    if (import.meta.env.MODE !== 'production') {
      return;
    }

    if (!posthog) {
      console.error(
        'Attempted to send analytic event but posthog was undefined',
      );
      return;
    }

    posthog.capture(eventName, { ...eventProps });
  }

  return {
    captureAnalyticEvent,
  };
};
