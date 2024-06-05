import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, Route, Routes, useNavigate } from 'react-router-dom';

import PublicSharedFolderSubscription from '../components/subscriptions/public-shared-folders';
import MySubscriptions from '../components/subscriptions/subscriptions';
import { VectorFolderSelectionProvider } from '../components/vector-fs/components/folder-selection-list';
import { VectorFsProvider } from '../components/vector-fs/context/vector-fs-context';
import VectorFs from '../components/vector-fs/vector-fs';
import SearchNodeFiles from '../components/vector-search/search-node-files';
import {
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeSetOptionsMutation,
  useShinkaiNodeSpawnMutation,
} from '../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useShinkaiNodeEventsToast } from '../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import { ShinkaiNodeRunningOverlay } from '../lib/shinkai-node-overlay';
import AgentsPage from '../pages/agents';
import AIModelInstallation from '../pages/ai-model-installation';
import AgentsLocally from '../pages/ai-model-locally';
import AnalyticsPage from '../pages/analytics';
import AnalyticsSettingsPage from '../pages/analytics-settings';
import ChatConversation from '../pages/chat/chat-conversation';
import EmptyMessage from '../pages/chat/empty-message';
import ChatLayout from '../pages/chat/layout';
import { ConnectMethodQrCodePage } from '../pages/connect-method-qr-code';
import CreateAgentPage from '../pages/create-agent';
import CreateChatPage from '../pages/create-chat';
import CreateJobPage from '../pages/create-job';
import { ExportConnection } from '../pages/export-connection';
import FreeSubscriptionsPage from '../pages/free-subscription';
import GenerateCodePage from '../pages/generate-code';
import GetStartedPage from '../pages/get-started';
import MainLayout from '../pages/layout/main-layout';
import OnboardingPage from '../pages/onboarding';
import { PublicKeys } from '../pages/public-keys';
import RestoreConnectionPage from '../pages/restore-connection';
import SettingsPage from '../pages/settings';
import ShinkaiPrivatePage from '../pages/shinkai-private';
import UnavailableShinkaiNode from '../pages/unavailable-shinkai-node';
import TermsAndConditionsPage from '../pages/welcome';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';
import {
  CREATE_CHAT_PATH,
  CREATE_JOB_PATH,
  EXPORT_CONNECTION,
  GENERATE_CODE_PATH,
  SETTINGS_PATH,
} from './name';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth((state) => state.auth);
  const shinkaiNodeOptions = useShinkaiNodeManager(
    (state) => state.shinkaiNodeOptions,
  );
  useShinkaiNodeEventsToast();
  const isInUse = useShinkaiNodeManager((state) => state.isInUse);
  const autoStartShinkaiNodeTried = useRef<boolean>(false);
  const { data: shinkaiNodeIsRunning } = useShinkaiNodeIsRunningQuery({
    refetchInterval: 1000,
  });
  const { mutateAsync: shinkaiNodeSetOptions } =
    useShinkaiNodeSetOptionsMutation();
  const { mutateAsync: shinkaiNodeSpawn } = useShinkaiNodeSpawnMutation({});

  /*
    All this auto start code is a workaround while we implement a way to synchronize the app state between browser and tauri
    Node auto start process probably should be in rust side
  */
  useEffect(() => {
    if (
      !autoStartShinkaiNodeTried.current &&
      isInUse &&
      !shinkaiNodeIsRunning
    ) {
      autoStartShinkaiNodeTried.current = true;
      Promise.resolve().then(async () => {
        if (shinkaiNodeOptions) {
          await shinkaiNodeSetOptions(shinkaiNodeOptions);
        }
        await shinkaiNodeSpawn();
      });
    }
  }, [
    auth,
    shinkaiNodeSpawn,
    autoStartShinkaiNodeTried,
    shinkaiNodeIsRunning,
    shinkaiNodeOptions,
    shinkaiNodeSetOptions,
    isInUse,
  ]);

  if (!auth) {
    return <Navigate replace to={'/welcome'} />;
  }

  return <ShinkaiNodeRunningOverlay>{children}</ShinkaiNodeRunningOverlay>;
};

const useOnboardingRedirect = () => {
  const termsAndConditionsAccepted = useSettings(
    (state) => state.termsAndConditionsAccepted,
  );
  const optInAnalytics = useSettings((state) => state.optInAnalytics);
  const navigate = useNavigate();

  useEffect(() => {
    if (termsAndConditionsAccepted === undefined) {
      navigate('/welcome');
      return;
    }

    if (optInAnalytics === undefined) {
      navigate('/analytics');
      return;
    }
  }, []);
};

const AppRoutes = () => {
  useOnboardingRedirect();

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          element={<UnavailableShinkaiNode />}
          path={'/unavailable-shinkai-node'}
        />
        <Route element={<TermsAndConditionsPage />} path={'/welcome'} />
        <Route element={<GetStartedPage />} path={'/get-started'} />
        <Route element={<AnalyticsPage />} path={'/analytics'} />
        <Route element={<ShinkaiPrivatePage />} path={'/connect-ai'} />
        <Route
          element={<FreeSubscriptionsPage />}
          path={'/free-subscriptions'}
        />
        <Route
          element={<AIModelInstallation />}
          path={'/ai-model-installation'}
        />
        <Route element={<OnboardingPage />} path={'/onboarding'} />
        <Route element={<RestoreConnectionPage />} path={'/restore'} />
        <Route element={<ConnectMethodQrCodePage />} path={'/connect-qr'} />
        <Route
          element={
            <ProtectedRoute>
              <ChatLayout />
            </ProtectedRoute>
          }
          path="inboxes"
        >
          <Route element={<EmptyMessage />} index />
          <Route element={<ChatConversation />} path=":inboxId" />
        </Route>

        <Route
          element={
            <ProtectedRoute>
              <VectorFsProvider>
                <Outlet />
              </VectorFsProvider>
            </ProtectedRoute>
          }
        >
          <Route element={<VectorFs />} path="vector-fs" />
          <Route
            element={
              <VectorFolderSelectionProvider>
                <SearchNodeFiles />
              </VectorFolderSelectionProvider>
            }
            path="vector-search"
          />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <VectorFsProvider>
                <Outlet />
              </VectorFsProvider>
            </ProtectedRoute>
          }
        >
          <Route element={<MySubscriptions />} path="my-subscriptions" />
          <Route
            element={<PublicSharedFolderSubscription />}
            path="public-subscriptions"
          />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          }
        >
          <Route element={<CreateAgentPage />} path="add-agent" />
          <Route element={<AgentsLocally />} path="agents-locally" />
          <Route element={<AgentsPage />} index path="agents" />
        </Route>
        <Route
          element={
            <ProtectedRoute>
              <CreateChatPage />
            </ProtectedRoute>
          }
          path={CREATE_CHAT_PATH}
        />
        <Route
          element={
            <ProtectedRoute>
              <CreateJobPage />
            </ProtectedRoute>
          }
          path={CREATE_JOB_PATH}
        />
        <Route
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
          path={SETTINGS_PATH}
        />
        <Route
          element={
            <ProtectedRoute>
              <GenerateCodePage />
            </ProtectedRoute>
          }
          path={GENERATE_CODE_PATH}
        />
        <Route
          element={
            <ProtectedRoute>
              <ExportConnection />
            </ProtectedRoute>
          }
          path={EXPORT_CONNECTION}
        />
        <Route
          element={
            <ProtectedRoute>
              <PublicKeys />
            </ProtectedRoute>
          }
          path={'public-keys'}
        />
        <Route
          element={
            <ProtectedRoute>
              <AnalyticsSettingsPage />
            </ProtectedRoute>
          }
          path={'analytics-settings'}
        />
      </Route>
      <Route element={<Navigate replace to={'inboxes/'} />} path="/" />
    </Routes>
  );
};
export default AppRoutes;
