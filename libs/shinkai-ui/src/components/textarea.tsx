import * as React from 'react';

import { cn } from '../utils';

const MIN_TEXTAREA_HEIGHT = 32;
export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useLayoutEffect(() => {
      // Reset height - important to shrink on delete
      if (!textareaRef.current) return;
      textareaRef.current.style.height = 'inherit';
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
      <textarea
        className={cn(
          'flex min-h-[60px] w-full rounded-md border border-gray-200 bg-gray-400 px-4 py-2 pt-7 text-sm placeholder-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={textareaRef}
        style={{
          minHeight: MIN_TEXTAREA_HEIGHT,
          resize: 'none',
          maxHeight: '300px',
        }}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
