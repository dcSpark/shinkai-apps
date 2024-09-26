import './globals.css';

import {
  Button,
  ScrollArea,
  Separator,
  Toaster,
} from '@shinkai_network/shinkai-ui';
import { QueryClientProvider } from '@tanstack/react-query';
import { Bot } from 'lucide-react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { shinkaiNodeQueryClient } from '../../lib/shinkai-node-manager/shinkai-node-manager-client';
import { useShinkaiNodeEventsToast } from '../../lib/shinkai-node-manager/shinkai-node-manager-hooks';
import { initSyncStorage } from '../../store/sync-utils';

initSyncStorage();

const App = () => {
  useShinkaiNodeEventsToast();

  return (
    <div className="h-full w-full rounded-xl bg-white bg-opacity-20 shadow-lg backdrop-blur-lg">
      <div className="flex items-center space-x-3 p-4">
        <input
          autoFocus
          className="flex-grow bg-transparent text-lg text-white placeholder-gray-300 focus:outline-none"
          placeholder="Search..."
          type="text"
        />
        <Button className="text-white" size="icon" variant="ghost">
          <Bot className="h-5 w-5" />
        </Button>
      </div>
      <Separator className="bg-white bg-opacity-20" />
      <ScrollArea className="h-64">
        <div className="p-2">
          {/* Add search results or recent items here */}
        </div>
      </ScrollArea>
    </div>
  );
};

ReactDOM.createRoot(document.querySelector('#root') as HTMLElement).render(
  <QueryClientProvider client={shinkaiNodeQueryClient}>
    <React.StrictMode>
      <App />
      <Toaster />
    </React.StrictMode>
  </QueryClientProvider>,
);
