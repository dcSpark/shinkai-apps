import { ApiConfig } from '@shinkai_network/shinkai-message-ts/api';
import React, { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ChatConversation from '../pages/chat/chat-conversation';
import EmptyMessage from '../pages/chat/empty-message';
import ChatLayout from '../pages/chat/layout';
import CreateAgentPage from '../pages/create-agent';
import CreateChatPage from '../pages/create-chat';
import CreateJobPage from '../pages/create-job';
import GenerateCodePage from '../pages/generate-code';
import MainLayout from '../pages/layout/main-layout';
import OnboardingPage from '../pages/onboarding';
import SettingsPage from '../pages/settings';
import WelcomePage from '../pages/welcome';
import { useAuth } from '../store/auth';
import {
  ADD_AGENT_PATH,
  CREATE_CHAT_PATH,
  CREATE_JOB_PATH,
  GENERATE_CODE_PATH,
  ONBOARDING_PATH,
  SETTINGS_PATH,
} from './name';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth((state) => state.auth);

  useEffect(() => {
    ApiConfig.getInstance().setEndpoint(auth?.node_address ?? '');
  }, [auth?.node_address]);

  if (!auth) {
    return <Navigate replace to={'/welcome'} />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route element={<WelcomePage />} path={'/welcome'} />
        <Route element={<OnboardingPage />} path={ONBOARDING_PATH} />
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
      </Route>
      <Route element={<Navigate replace to={'inboxes/'} />} path="/" />
    </Routes>
  );
};
export default AppRoutes;
