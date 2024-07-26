import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { WorkflowPlaygroundIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Column } from '@tanstack/react-table';
import { BotIcon, ChevronRight, EyeOff, TextIcon, Trash } from 'lucide-react';
import React from 'react';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

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
            <span className="flex-1 truncate text-left">{title}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex flex-col bg-gray-300 px-0 py-2 text-xs"
        >
          <p className="px-3 py-1 text-left text-xs font-medium">{title}</p>
          <Separator className="my-1 bg-gray-200" orientation="horizontal" />
          <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
            <span className="text-gray-80">Type</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-gray-50">
                <TextIcon className="h-3.5 w-3.5" />
                Text
              </span>
              <ChevronRight className="text-gray-80 h-3.5 w-3.5" />
            </div>
          </button>
          <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
            <span className="text-gray-80">AI</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-gray-50">
                <BotIcon className="h-3.5 w-3.5" />
                gpt_turbo_4
              </span>
              <ChevronRight className="text-gray-80 h-3.5 w-3.5" />
            </div>
          </button>
          <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
            <span className="text-gray-80">Workflow</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-gray-50">
                <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                Summarize
              </span>
              <ChevronRight className="text-gray-80 h-3.5 w-3.5" />
            </div>
          </button>
          <div className="flex justify-between gap-2 px-3 py-2">
            <Textarea
              autoFocus
              className="placeholder-gray-80 !min-h-[100px] resize-none bg-gray-500 pl-2 pt-2 text-xs"
              placeholder="Enter prompt"
            />
          </div>
          <Separator className="my-1 bg-gray-200" orientation="horizontal" />
          <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
            <EyeOff className="h-3.5 w-3.5" />
            <span className="">Hide Property</span>
          </button>
          <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
            <Trash className="h-3.5 w-3.5" />
            <span className="">Delete Property</span>
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
