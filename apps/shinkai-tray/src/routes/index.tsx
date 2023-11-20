import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ApiConfig } from "@shinkai_network/shinkai-message-ts/api";
import { invoke } from "@tauri-apps/api/tauri";

import OnboardingPage from "../pages/onboarding.tsx";
import SettingsPage from "../pages/settings";
import ChatConversation from "../pages/chat/chat-conversation";
import EmptyMessage from "../pages/chat/empty-message";
import ChatLayout from "../pages/chat/layout";
import CreateAgentPage from "../pages/create-agent";
import CreateChatPage from "../pages/create-chat";
import CreateJobPage from "../pages/create-job";
import MainLayout from "../pages/layout/main-layout";
import { useAuth } from "../store/auth";
import {
  ADD_AGENT_PATH,
  CREATE_CHAT_PATH,
  CREATE_JOB_PATH,
  GENERATE_CODE_PATH,
  ONBOARDING_PATH,
  SETTINGS_PATH,
} from "./name";
import GenerateCodePage from "../pages/generate-code.tsx";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth((state) => state.auth);

  useEffect(() => {
    ApiConfig.getInstance().setEndpoint(auth?.node_address ?? "");
  }, [auth?.node_address]);

  if (!auth) {
    return <Navigate to={ONBOARDING_PATH} replace />;
  }
  return children;
};

const AppRoutes = () => {
  useEffect(() => {
    console.log("Registering hotkey");
    // Register the global shortcut
    // register("Alt+Shift+Enter", async () => {
    //   console.log("Hotkey activated");
    // });

    // Check if setup data is valid
    (invoke("validate_setup_data") as Promise<boolean>)
      .then((isValid: boolean) => {
        console.log("is already", isValid);
      })
      .catch((error: string) => {
        console.error("Failed to validate setup data:", error);
      });
  }, []);

  return (
    <Routes>
      <Route element={<MainLayout />}>
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
      <Route element={<Navigate to={"inboxes/"} replace />} path="/" />
    </Routes>
  );
};
export default AppRoutes;
