import * as TogglePrimitive from '@radix-ui/react-toggle';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../utils';

const toggleVariants = cva(
  'ring-offset-background hover:bg-muted hover:text-gray-80 focus-visible:ring-ring inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[#2D3239] data-[state=on]:text-white',
  {
    variants: {
      variant: {
        default: 'bg-[#27252B]',
        outline:
          'border-input hover:bg-accent hover:text-accent-foreground border bg-transparent',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    className={cn(toggleVariants({ variant, size, className }))}
    ref={ref}
    {...props}
  />
));

Toggle.displayName = TogglePrimitive.Root.displayName;

export { Toggle, toggleVariants };
