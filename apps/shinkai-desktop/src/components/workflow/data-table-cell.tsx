import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
// import { Row } from '@tanstack/react-table';
import { TextIcon } from 'lucide-react';
import React from 'react';

interface DataTableCellProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  // row: Row<TData>;
  title: string;
  value: string;
}

export function DataTableCell<TData>({
  // row,
  value,
  className,
}: DataTableCellProps<TData>) {
  return (
    <div className={cn('w-full', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="-ml-1.5 flex h-8 w-full justify-start gap-1.5 truncate rounded-lg bg-transparent px-2 pr-0 hover:bg-gray-300 data-[state=open]:bg-gray-300"
            size="sm"
            variant="ghost"
          >
            <TextIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 truncate text-left">{value}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex flex-col bg-gray-300 px-0 py-2 text-xs"
        >
          <Textarea value={value} />
        </PopoverContent>
      </Popover>
    </div>
  );
}
