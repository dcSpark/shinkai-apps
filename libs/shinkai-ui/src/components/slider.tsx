import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { cn } from '../utils';

const Slider = ({
  className,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) => (
  <SliderPrimitive.Root
    className={cn(
      'relative flex w-full touch-none items-center select-none',
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gray-200">
      <SliderPrimitive.Range className="bg-brand absolute h-full" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="ring-offset-brand focus-visible:ring-ring bg-brand border-brand-500 block h-5 w-5 rounded-full border-2 transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50" />
  </SliderPrimitive.Root>
);
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
