/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';

import { cn } from '../utils';
import { DotsLoader } from './dots-loader';
import { FormLabel } from './form';

const MIN_TEXTAREA_HEIGHT = 32;
export interface PromptTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isLoading?: boolean;
  label?: string;
  field: {
    onChange: (...event: any[]) => void;
    onBlur: () => void;
    value: any;
    disabled?: boolean;
    name: string;
    placeholder?: string;
  };
}

const PromptTextarea = React.forwardRef<
  HTMLTextAreaElement,
  PromptTextareaProps
>(({ className, ...props }) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useLayoutEffect(() => {
    // Reset height - important to shrink on delete

    if (!textareaRef.current) return;

    textareaRef.current.style.height = '60px';
    // Set height
    textareaRef.current.style.height = `${Math.max(
      textareaRef.current.scrollHeight + 2,
      MIN_TEXTAREA_HEIGHT,
    )}px`;

    if (props.autoFocus !== undefined && props.autoFocus) {
      textareaRef.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  return (
    <>
      <textarea
        className={cn(
          'flex w-full rounded-md border border-gray-200 bg-gray-400 px-4 py-2 pt-4 text-sm placeholder-gray-100 placeholder:text-base focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        style={{
          minHeight: MIN_TEXTAREA_HEIGHT,
          resize: 'none',
          maxHeight: '300px',
        }}
        {...props.field}
        onKeyDown={props.onKeyDown}
        ref={textareaRef}
        {...(!props.isLoading && {
          placeholder: props.label,
        })}
      />

      {props.isLoading ? (
        <DotsLoader className="absolute left-4 top-6" />
      ) : null}
      <FormLabel className="sr-only">{props.label}</FormLabel>
    </>
  );
});
PromptTextarea.displayName = 'PromptTextarea';

export { PromptTextarea };
