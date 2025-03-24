import * as React from 'react';

import { cn } from '../utils';

const DEFAULT_MIN_TEXTAREA_HEIGHT = 32;
const DEFAULT_MAX_TEXTAREA_HEIGHT = 300;

export type TextareaProps =
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
    minHeight?: number;
    maxHeight?: number;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
  };

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      minHeight = DEFAULT_MIN_TEXTAREA_HEIGHT,
      maxHeight = DEFAULT_MAX_TEXTAREA_HEIGHT,
      resize = 'none',
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useLayoutEffect(() => {
      // Reset height - important to shrink on delete
      if (!textareaRef.current) return;
      textareaRef.current.style.height = 'inherit';
      // Set height
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight + 2,
        minHeight,
      )}px`;

      if (props.autoFocus !== undefined && props.autoFocus) {
        textareaRef.current.focus();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value, minHeight, maxHeight]);

    return (
      <textarea
        className={cn(
          'bg-official-gray-900 placeholder-official-gray-500 flex w-full rounded-md border border-gray-200 px-4 py-2 pt-7 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-100 disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref || textareaRef}
        style={{
          minHeight: `${minHeight}px`,
          maxHeight: `${maxHeight}px`,
          resize: resize,
        }}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
