import * as Sentry from '@sentry/react';
import { info } from '@tauri-apps/plugin-log';
import { attachConsole } from '@tauri-apps/plugin-log';
import React from 'react';
import {
  createRoutesFromChildren,
  matchRoutes,
  Routes,
  useLocation,
  useNavigationType,
} from 'react-router-dom';
import {
  makeRendererTransport,
  sendBreadcrumbToRust,
} from 'tauri-plugin-sentry-api';

import { useSettings } from '../store/settings';

attachConsole();

let enabled = useSettings.getState().optInAnalytics;
info(`sentry state: ${enabled}`);

useSettings.subscribe((state) => {
  enabled = !!state.optInAnalytics;
  info(`sentry state: ${enabled}`);
});

export const initSentry = () =>
  Sentry.init({
    dsn: 'https://dummy@dummy.ingest.us.sentry.io/1',
    integrations: [
      Sentry.captureConsoleIntegration({ levels: ['error'] }),
      Sentry.reactRouterV6BrowserTracingIntegration({
        useEffect: React.useEffect,
        useLocation,
        useNavigationType,
        createRoutesFromChildren,
        matchRoutes,
      }),
    ],
    tracesSampleRate: 1.0,
    transport: makeRendererTransport,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    beforeBreadcrumb: sendBreadcrumbToRust,
    beforeSend(event) {
      if (!enabled) {
        return null;
      }
      return event;
    },
  });

export const SentryRoutes = Sentry.withSentryReactRouterV6Routing(Routes);
