import * as React from 'react';
import { useRef } from 'react';

import { ChatInput } from './chat-input';

export const ChatInputArea = ({
  value,
  onChange,
  autoFocus,
  onSubmit,
  disabled,
  isLoading,
  placeholder,
  topAddons,
  bottomAddons,
}: {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  topAddons?: React.ReactNode;
  bottomAddons?: React.ReactNode;
}) => {
  const chatInputAreaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div className="flex w-full max-w-full flex-col rounded-lg border border-gray-300 bg-gray-400 px-1 py-1 text-sm shadow-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
      {topAddons}
      <div
        aria-disabled={disabled}
        className="flex cursor-text flex-col aria-disabled:cursor-not-allowed"
        onClick={() => chatInputAreaRef?.current?.focus()}
      >
        <ChatInput
          autoFocus={autoFocus}
          disabled={disabled || isLoading}
          onChange={(e) => onChange(e.target.value)}
          onSend={onSubmit}
          placeholder={placeholder ?? 'Send a message'}
          ref={chatInputAreaRef}
          value={value}
        />
        {bottomAddons}
      </div>
    </div>
  );
};
