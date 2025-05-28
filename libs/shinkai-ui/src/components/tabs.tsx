import * as TabsPrimitive from '@radix-ui/react-tabs';
import * as React from 'react';

import { cn } from '../utils';

const Tabs = TabsPrimitive.Root;

const TabsList = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-[#27252B] p-1 text-gray-100',
      className,
    )}
    {...props}
  />
);
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) => (
  <TabsPrimitive.Trigger
    className={cn(
      'ring-offset-background focus-visible:ring-ring inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[#2D3239] data-[state=active]:text-white data-[state=active]:shadow-sm',
      className,
    )}
    {...props}
  />
);
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = ({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) => (
  <TabsPrimitive.Content
    className={cn(
      'ring-offset-background focus-visible:ring-ring mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
);
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
