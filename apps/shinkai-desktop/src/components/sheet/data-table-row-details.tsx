import { DialogClose } from '@radix-ui/react-dialog';
import {
  Columns,
  FormattedRow,
} from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Row } from '@tanstack/react-table';
import { Maximize2, XIcon } from 'lucide-react';

interface DataTableRowDetailsProps {
  row: Row<FormattedRow>;
  columns: Columns;
}

export function DataTableRowDetails({
  row,
  columns,
}: DataTableRowDetailsProps) {
  return (
    <div className={cn('w-full')}>
      <Dialog>
        <DialogTrigger asChild>
          <div
            className="flex h-6 w-6 items-center justify-center gap-1.5 rounded-lg bg-transparent hover:bg-gray-500"
            role="button"
            tabIndex={0}
          >
            <Maximize2 className="text-gray-80 h-3.5 w-3.5" />
          </div>
        </DialogTrigger>
        <DialogContent className="flex flex-col p-5 text-xs">
          <DialogClose className="absolute right-4 top-4">
            <XIcon className="text-gray-80 h-5 w-5" />
          </DialogClose>
          <DialogHeader className="flex justify-between">
            <DialogTitle className="text-left text-sm font-bold">
              Row Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {Object.entries(row.original.fields).map(([columnId, value]) => {
              return (
                <UpdateFieldForm
                  key={columnId}
                  name={columns?.[columnId]?.name}
                  value={value.value}
                />
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UpdateFieldForm({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex flex-col justify-between gap-2 pt-0">
      <p>{name}</p>
      <Textarea
        className="!min-h-[100px] resize-none bg-gray-200 pl-2 pt-2 text-xs placeholder-transparent"
        placeholder={'Enter prompt or a formula...'}
        readOnly
        spellCheck={false}
        value={value ?? ' '}
      />
    </div>
  );
}
