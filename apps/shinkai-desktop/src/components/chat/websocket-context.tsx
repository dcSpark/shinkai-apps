import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import React, { createContext, useContext, useEffect, useRef } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { useAuth } from '../../store/auth';

interface WebSocketContextProps {
  sendMessage: (message: string) => void;
  lastMessage: MessageEvent<any> | null;
  readyState: ReadyState;
}

const WebSocketContext = createContext<WebSocketContextProps | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const auth = useAuth((state) => state.auth);
  const nodeAddressUrl = new URL(auth?.node_address ?? 'http://localhost:9850');
  const socketUrl = `ws://${nodeAddressUrl.hostname}:${Number(nodeAddressUrl.port) + 1}/ws`;
  const didUnmount = useRef(false);

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    {
      share: true,
      shouldReconnect: (closeEvent) => !didUnmount.current,
      reconnectAttempts: 10,
      reconnectInterval: 3000,
    },
    !!auth
  );

  useEffect(() => {
    if (readyState === ReadyState.OPEN && auth) {
      const wsMessage = { subscriptions: [], unsubscriptions: [] };
      const wsMessageString = JSON.stringify(wsMessage);
      const shinkaiMessage = ShinkaiMessageBuilderWrapper.ws_connection(
        wsMessageString,
        auth?.profile_encryption_sk ?? '',
        auth?.profile_identity_sk ?? '',
        auth?.node_encryption_pk ?? '',
        auth?.shinkai_identity ?? '',
        auth?.profile ?? '',
        auth?.shinkai_identity ?? '',
        ''
      );
      sendMessage(shinkaiMessage);
    }
  }, [readyState, auth, sendMessage]);

  useEffect(() => {
    return () => {
      didUnmount.current = true;
    };
  }, []);

  const contextValue = { sendMessage, lastMessage, readyState };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}; 