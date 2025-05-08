import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { ChatProvider } from '@shinkai/shared/chat';
import styles from './app.module.css';
import ChatPage from '../pages/chat/chat-page';

export function App() {
  return (
    <ChatProvider>
      <div className={styles.app}>
        <Routes>
          <Route path="/" element={<ChatPage />} />
          <Route path="/chat/:inboxId" element={<ChatPage />} />
        </Routes>
      </div>
    </ChatProvider>
  );
}

export default App;
