import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Row } from '@tanstack/react-table';
import React from 'react';

interface DataTableCellProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  row: Row<TData>;
  title: string;
  value: string;
}

export function DataTableCell<TData>({
  value,
  className,
}: DataTableCellProps<TData>) {
  return (
    <div className={cn('w-full', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="-ml-1.5 flex h-8 w-full justify-start gap-1.5 rounded-lg bg-transparent px-2 py-1 pr-0 hover:bg-gray-300"
            size="sm"
            variant="ghost"
          >
            <span className="line-clamp-1 flex-1 text-left text-gray-50">
              {value}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex flex-col bg-gray-300 p-0 text-xs"
          side="bottom"
          sideOffset={-32}
        >
          <Textarea
            autoFocus
            className="placeholder-gray-80 border-brand focus-visible:ring-brand !min-h-[80px] resize-none bg-gray-500 pl-2 pt-2 text-xs"
            placeholder="Enter prompt"
            value={value}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
