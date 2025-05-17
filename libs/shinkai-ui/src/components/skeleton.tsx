import React from 'react';

import { cn } from '../utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-official-gray-700/10 animate-pulse rounded-md dark:bg-gray-50/10',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
