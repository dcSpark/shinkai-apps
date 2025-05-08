import React from 'react';


export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  status: {
    type: 'complete' | 'running' | 'error';
    message?: string;
  };
  artifacts?: Array<{
    id: string;
    name: string;
    type: string;
    content: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface PaginatedMessages {
  pages: Message[][];
  content: Message[];
}

interface MessageListProps {
  containerClassName?: string;
  editAndRegenerateMessage?: (content: string, parentHash: string) => Promise<void>;
  fetchPreviousPage?: () => void;
  hasPreviousPage?: boolean;
  isFetchingPreviousPage?: boolean;
  isLoading?: boolean;
  isSuccess?: boolean;
  messageExtra?: React.ReactNode;
  noMoreMessageLabel?: string;
  paginatedMessages?: PaginatedMessages;
  regenerateMessage?: (messageId: string) => Promise<void>;
}

export const MessageList: React.FC<MessageListProps> = ({
  containerClassName = '',
  editAndRegenerateMessage,
  fetchPreviousPage,
  hasPreviousPage,
  isFetchingPreviousPage,
  isLoading,
  isSuccess,
  messageExtra,
  noMoreMessageLabel = 'No more messages',
  paginatedMessages,
  regenerateMessage,
}) => {
  
  return (
    <div className={`flex-1 overflow-y-auto ${containerClassName}`}>
      {isLoading && (
        <div className="flex h-full items-center justify-center">
          <p>Loading messages...</p>
        </div>
      )}
      
      {isSuccess && paginatedMessages && (
        <div className="flex flex-col space-y-4">
          {hasPreviousPage && (
            <button
              className="mx-auto mt-2 rounded bg-blue-500 px-4 py-2 text-white"
              disabled={isFetchingPreviousPage}
              onClick={() => fetchPreviousPage?.()}
            >
              {isFetchingPreviousPage ? 'Loading...' : 'Load more messages'}
            </button>
          )}
          
          {!hasPreviousPage && (
            <div className="mx-auto mt-2 text-sm text-gray-500">
              {noMoreMessageLabel}
            </div>
          )}
          
          {paginatedMessages.content.map((message) => (
            <div
              key={message.id}
              className={`rounded-lg p-4 ${
                message.role === 'user' ? 'bg-blue-100' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {message.role === 'user' ? 'You' : 'Assistant'}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-2 whitespace-pre-wrap">{message.content}</div>
              
              {message.role === 'assistant' && message.status.type === 'complete' && (
                <div className="mt-2 flex space-x-2">
                  <button
                    className="rounded bg-gray-200 px-2 py-1 text-xs"
                    onClick={() => regenerateMessage?.(message.id)}
                  >
                    Regenerate
                  </button>
                </div>
              )}
              
              {message.artifacts && message.artifacts.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Artifacts:</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {message.artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="rounded bg-gray-200 px-2 py-1 text-xs"
                      >
                        {artifact.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {messageExtra}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
