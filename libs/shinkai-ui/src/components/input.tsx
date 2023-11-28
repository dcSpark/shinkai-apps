import * as React from 'react';

import { cn } from '../utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        className={cn(
          'h-input peer w-full rounded-lg border border-gray-200 bg-gray-400 px-4 py-3 pt-8 text-sm font-medium text-white placeholder-transparent outline outline-0 transition-all placeholder-shown:border placeholder-shown:border-gray-200 focus:border focus:border-gray-100 focus:outline-0 disabled:border-0 disabled:bg-gray-300 disabled:text-gray-100',
          className,
        )}
        placeholder=" "
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
