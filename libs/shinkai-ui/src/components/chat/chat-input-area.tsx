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
  textareaClassName?: string;
  className?: string;
  alternateElement?: React.ReactNode;
  ref?: React.RefObject<HTMLTextAreaElement | null>;
};
export const ChatInputArea = ({
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
  textareaClassName,
  alternateElement,
  className,
  ref,
}: ChatInputAreaProps) => {
  const textareaRef = useCombinedRefs<HTMLTextAreaElement>(
    ref as React.RefObject<HTMLTextAreaElement>,
  );

  return (
    <div
      className={cn(
        'bg-official-gray-900 flex w-full max-w-full flex-col rounded-xl text-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
        'shadow-official-gray-750 focus-within:shadow-official-gray-700 overflow-hidden shadow-[0_0_0_1px_currentColor] transition-shadow',
        className,
      )}
    >
      {topAddons}
      <div
        aria-disabled={disabled}
        className="flex cursor-text flex-col aria-disabled:cursor-not-allowed"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            textareaRef?.current?.focus();
          }
        }}
      >
        {alternateElement ? (
          alternateElement
        ) : (
          <ChatInput
            autoFocus={autoFocus}
            className={textareaClassName}
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
        )}
        {bottomAddons}
      </div>
    </div>
  );
};

ChatInputArea.displayName = 'ChatInputArea';
