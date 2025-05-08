import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { MessageList } from '@shinkai/shared/chat';

const ChatPage: React.FC = () => {
  const { inboxId } = useParams<{ inboxId: string }>();
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: number;
    status: { type: string; message?: string };
    artifacts?: Array<{
      id: string;
      name: string;
      type: string;
      content: string;
      metadata?: Record<string, unknown>;
    }>;
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: Date.now(),
      status: { type: 'complete' },
    };

    setMessages((prev) => [...prev, userMessage] as any);
    setInputValue('');
    setIsLoading(true);

    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `This is a placeholder response to: "${inputValue}"`,
        timestamp: Date.now() + 1000,
        status: { type: 'complete' },
      };

      setMessages((prev) => [...prev, assistantMessage] as any);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const paginatedMessages = {
    pages: [messages],
    content: messages,
  } as any;

  return (
    <div className="flex h-screen flex-col">
      <header className="bg-blue-600 p-4 text-white">
        <h1 className="text-xl font-bold">Shinkai Web</h1>
        {inboxId && <p className="text-sm">Conversation: {inboxId}</p>}
      </header>
      
      <main className="flex-1 overflow-hidden p-4">
        <div className="flex h-full flex-col rounded-lg border border-gray-200 bg-white shadow-sm">
          <MessageList
            containerClassName="p-4"
            isLoading={isLoading}
            isSuccess={true}
            paginatedMessages={paginatedMessages}
          />
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex">
              <textarea
                className="flex-1 rounded-l-lg border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                placeholder="Type a message..."
                rows={1}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="rounded-r-lg bg-blue-600 px-4 py-2 text-white"
                onClick={handleSendMessage}
                disabled={isLoading}
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
