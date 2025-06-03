import { useGetHealth } from '@shinkai_network/shinkai-node-state/v2/queries/getHealth/useGetHealth';
import { PostHogProvider, usePostHog } from 'posthog-js/react';
import React, { useEffect } from 'react';

import { OnboardingStep } from '../components/onboarding/constants';
import config from '../config';
import { useAuth } from '../store/auth';
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
  const optInAnalytics = useSettings((state) =>
    state.getStepChoice(OnboardingStep.ANALYTICS),
  );
  const posthog = usePostHog();

  const posthogApiKey = config.posthogApiKey;

  const options = {
    api_host: 'https://us.i.posthog.com',
    // default `false`, make sure we do not capture sensitive info
    disable_session_recording: true,
    autocapture: false,
    loaded: () => {
      if (config.isDev) posthog.debug();
    },
    opt_out_capturing_by_default: false,
  };

  useEffect(() => {
    if (optInAnalytics) {
      posthog.opt_in_capturing();
    } else {
      posthog.opt_out_capturing();
    }
  }, [optInAnalytics, posthog]);

  return optInAnalytics && posthogApiKey ? (
    <PostHogProvider apiKey={posthogApiKey} options={options}>
      {children}
    </PostHogProvider>
  ) : (
    children
  );
};

export type AnalyticEventName =
  | 'Chat with Pre-built Agents'
  | 'Chat with Custom Agents'
  | 'Agent Created'
  | 'Agent Imported'
  | 'Custom Tool Created'
  | 'MCP Server Added'
  | 'Chat with AI Model'
  | 'Chat with Files'
  | 'Scheduled Task Created'
  | 'AI Chat with Files'
  | 'Upload Files'
  | 'Ask Local Files'
  | 'Edit and Regenerate Message';

export type AnalyticEventProps<TEventName extends AnalyticEventName> =
  TEventName extends 'Chat with Pre-built Agents'
    ? {
        agentName: string;
      }
    : TEventName extends 'Chat with Custom Agents'
      ? undefined
      : TEventName extends 'Agent Created'
        ? undefined
        : TEventName extends 'Agent Imported'
          ? undefined
          : TEventName extends 'Custom Tool Created'
            ? undefined
            : TEventName extends 'MCP Server Added'
              ? undefined
              : TEventName extends 'Chat with AI Model'
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
                      : TEventName extends 'Edit and Regenerate Message'
                        ? undefined
                        : undefined;

export const useAnalytics = () => {
  const posthog = usePostHog();

  const auth = useAuth((authStore) => authStore.auth);
  const { nodeInfo } = useGetHealth({
    nodeAddress: auth?.node_address ?? '',
  });

  function captureAnalyticEvent<TEventName extends AnalyticEventName>(
    eventName: TEventName,
    eventProps: AnalyticEventProps<TEventName>,
  ) {
    // Only send analytic events on production
    if (!config.isProduction) {
      return;
    }

    if (!posthog) {
      console.error(
        'Attempted to send analytic event but posthog was undefined',
      );
      return;
    }

    posthog.capture(eventName, {
      $browser_version: nodeInfo?.version,
      ...eventProps,
    });
  }

  return {
    captureAnalyticEvent,
  };
};
