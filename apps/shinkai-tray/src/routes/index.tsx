import React, { useEffect, useRef } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { toast } from 'sonner';

import ChatConversation from '../pages/chat/chat-conversation';
import EmptyMessage from '../pages/chat/empty-message';
import ChatLayout from '../pages/chat/layout';
import CreateAgentPage from '../pages/create-agent';
import CreateChatPage from '../pages/create-chat';
import CreateJobPage from '../pages/create-job';
import { ExportConnection } from '../pages/export-connection';
import GenerateCodePage from '../pages/generate-code';
import MainLayout from '../pages/layout/main-layout';
import OnboardingPage from '../pages/onboarding';
import RestoreConnectionPage from '../pages/restore-connection';
import SettingsPage from '../pages/settings';
import UnavailableShinkaiNode from '../pages/unavailable-shinkai-node';
import WelcomePage from '../pages/welcome';
import { useAuth } from '../store/auth';
import { useShinkaiNodeManager } from '../store/shinkai-node-manager';
import {
  useShinkaiNodeIsRunningQuery,
  useShinkaiNodeSetOptionsMutation,
  useShinkaiNodeSpawnMutation,
} from '../windows/shinkai-node-manager/shinkai-node-process-client';
import { SHINKAI_NODE_MANAGER_TOAST_ID } from '../windows/utils';
import {
  ADD_AGENT_PATH,
  CREATE_CHAT_PATH,
  CREATE_JOB_PATH,
  EXPORT_CONNECTION,
  GENERATE_CODE_PATH,
  ONBOARDING_PATH,
  SETTINGS_PATH,
} from './name';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth((state) => state.auth);
  const shinkaiNodeOptions = useShinkaiNodeManager(state => state.shinkaiNodeOptions);
  const autoStartShinkaiNodeTried = useRef<boolean>(false);
  const { data: shinkaiNodeIsRunning } = useShinkaiNodeIsRunningQuery({
    refetchInterval: 1000,
  });
  const { mutateAsync: shinkaiNodeSetOptions } = useShinkaiNodeSetOptionsMutation();
  const { mutateAsync: shinkaiNodeSpawn } = useShinkaiNodeSpawnMutation({
    onMutate: () => {
      toast.loading('Starting your local Shinkai Node automatically', {
        id: SHINKAI_NODE_MANAGER_TOAST_ID,
      });
    },
    onError: () => {
      toast.error(
        'Error starting your local Shinkai Node, see logs for more information',
        {
          id: SHINKAI_NODE_MANAGER_TOAST_ID,
        },
      );
    },
    onSuccess: () => {
      toast.success('Your local Shinkai Node is running', {
        id: SHINKAI_NODE_MANAGER_TOAST_ID,
      });
    },
  });

  /*
    All this auto start code is a workaround while we implement a way to synchronize the app state between browser and tauri
    Node auto start process probably should be in rust side
  */
  useEffect(() => {
    const isLocalShinkaiNode =
      auth?.node_address.includes('localhost') ||
      auth?.node_address.includes('127.0.0.1');
    if (
      !autoStartShinkaiNodeTried.current &&
      isLocalShinkaiNode &&
      !shinkaiNodeIsRunning
    ) {
      autoStartShinkaiNodeTried.current = true;
      Promise.resolve().then(async () => {
        if (shinkaiNodeOptions) {
          await shinkaiNodeSetOptions(shinkaiNodeOptions)
        }
        await shinkaiNodeSpawn();
      });
    }
  }, [auth, shinkaiNodeSpawn, autoStartShinkaiNodeTried, shinkaiNodeIsRunning, shinkaiNodeOptions, shinkaiNodeSetOptions]);

  if (!auth) {
    console.log('navigating to welcome');
    return <Navigate replace to={'/welcome'} />;
  }

  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route
          element={<UnavailableShinkaiNode />}
          path={'/unavailable-shinkai-node'}
        />
        <Route element={<WelcomePage />} path={'/welcome'} />
        <Route element={<OnboardingPage />} path={ONBOARDING_PATH} />
        <Route element={<RestoreConnectionPage />} path={'/restore'} />
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
              <CreateAgentPage />
            </ProtectedRoute>
          }
          path={ADD_AGENT_PATH}
        />
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
      </Route>
      <Route element={<Navigate replace to={'inboxes/'} />} path="/" />
    </Routes>
  );
};
export default AppRoutes;
