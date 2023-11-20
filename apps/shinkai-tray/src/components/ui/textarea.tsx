import * as React from "react";

import { cn } from "../../lib/utils";

const MIN_TEXTAREA_HEIGHT = 32;
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useLayoutEffect(() => {
      // Reset height - important to shrink on delete
      if (!textareaRef.current) return;
      textareaRef.current.style.height = "inherit";
      // Set height
      textareaRef.current.style.height = `${Math.max(
        textareaRef.current.scrollHeight,
        MIN_TEXTAREA_HEIGHT
      )}px`;

      if (props.autoFocus !== undefined && props.autoFocus) {
        textareaRef.current.focus()
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.value]);

    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-gray-500 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:placeholder:text-gray-400 dark:focus-visible:ring-gray-300",
          className
        )}
        style={{
          minHeight: MIN_TEXTAREA_HEIGHT,
          resize: "none",
          maxHeight: "300px",
        }}
        ref={textareaRef}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
