import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as React from 'react';

import { cn } from '../utils';

const ScrollArea = ({
  className,
  children,
  ref,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  ref?: React.RefObject<HTMLDivElement | null>;
}) => (
  <ScrollAreaPrimitive.Root
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport
      className="h-full w-full rounded-[inherit]"
      ref={ref}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = ({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    className={cn(
      'flex touch-none select-none transition-colors',
      orientation === 'vertical' &&
        'h-full w-2.5 border-l border-l-transparent p-[1px]',
      orientation === 'horizontal' &&
        'h-2.5 border-t border-t-transparent p-[1px]',
      className,
    )}
    orientation={orientation}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(
        'relative rounded-full bg-gray-300',
        orientation === 'vertical' && 'flex-1',
      )}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
);
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
