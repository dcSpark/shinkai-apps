import * as React from 'react';

import { useCombinedRefs } from '../../hooks/use-combined-refs';
import { cn } from '../../utils';
import { ChatInput } from './chat-input';

type ChatInputAreaProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onPaste?: (e: React.ClipboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  isLoading?: boolean;
  placeholder?: string;
  topAddons?: React.ReactNode;
  bottomAddons?: React.ReactNode;
};

export const ChatInputArea = React.forwardRef<
  HTMLTextAreaElement,
  ChatInputAreaProps
>(
  (
    {
      value,
      onChange,
      onPaste,
      onKeyDown,
      autoFocus,
      onSubmit,
      disabled,
      isLoading,
      placeholder,
      topAddons,
      bottomAddons,
    },
    ref,
  ) => {
    const textareaRef = useCombinedRefs<HTMLTextAreaElement>(ref);

    return (
      <div
        className={cn(
          'flex w-full max-w-full flex-col rounded-lg bg-gray-400 px-1 py-1 text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
          'shadow-[0_0_0_1px_currentColor] shadow-gray-300 transition-shadow focus-within:shadow-gray-200',
        )}
      >
        {topAddons}
        <div
          aria-disabled={disabled}
          className="flex cursor-text flex-col aria-disabled:cursor-not-allowed"
          onClick={() => textareaRef?.current?.focus()}
        >
          <ChatInput
            autoFocus={autoFocus}
            disabled={disabled || isLoading}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onSend={onSubmit}
            placeholder={
              placeholder ?? 'Send a message, or press "/" to access tools'
            }
            ref={textareaRef}
            value={value}
          />
          {bottomAddons}
        </div>
      </div>
    );
  },
);

ChatInputArea.displayName = 'ChatInputArea';
