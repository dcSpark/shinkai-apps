import { Slot } from '@radix-ui/react-slot';
import { cva,type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '../utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-gray-50',
  {
    variants: {
      variant: {
        default:
          'bg-brand hover:bg-brand-500 text-white disabled:bg-gray-200 disabled:text-gray-100',
        destructive:
          'bg-red-500 text-gray-50 shadow-sm hover:bg-red-500/90 dark:bg-red-900 dark:text-gray-50 dark:hover:bg-red-900/90',
        outline:
          'hover:bg-gray-350 border border-gray-200 bg-transparent shadow-sm hover:text-gray-50',
        secondary:
          'bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-100/80 dark:bg-gray-800 dark:text-gray-50 dark:hover:bg-gray-800/80',
        tertiary: 'bg-transparent hover:bg-gray-400/60',
        ghost: 'bg-gray-400 hover:bg-gray-400/60',
        link: 'text-white underline-offset-4 hover:underline dark:text-gray-50',
      },
      size: {
        default: 'h-[54px] px-8 py-4 text-base',
        sm: 'h-[40px] px-3 py-3 text-xs',
        lg: 'h-[54px] px-2 py-4 text-base',
        icon: 'h-9 w-9',
        auto: 'h-auto p-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, isLoading = false, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <Loader2
            className={cn('h-4 w-4 animate-spin', size !== 'icon' && 'mr-2')}
          />
        ) : null}
        {isLoading && size === 'icon' ? null : props.children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
