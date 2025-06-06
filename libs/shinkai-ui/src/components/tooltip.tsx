import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '../utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;
const TooltipArrow = TooltipPrimitive.TooltipArrow;

const TooltipContent = ({
  className,
  sideOffset = 4,
  showArrow = true,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  showArrow?: boolean;
}) => (
  <TooltipPrimitive.Content
    className={cn(
      'border-official-gray-780 bg-official-gray-1000 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-w-[280px] rounded-lg border px-3 py-1.5 text-xs text-white',
      className,
    )}
    sideOffset={sideOffset}
    {...props}
  >
    {props.children}

    {showArrow && (
      <TooltipPrimitive.Arrow className="fill-official-gray-1000 -my-px drop-shadow-[0_1px_0_#313336]" />
    )}
  </TooltipPrimitive.Content>
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipPortal,
  TooltipArrow,
};
