import { useSetCellSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/setCellSheet/useSetCellSheet';
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import React from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../store/auth';

interface DataTableCellProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  row: Row<TData>;
  column: ColumnDef<TData>;
  title: string;
  value: string;
}

export function DataTableCell<TData>({
  row,
  value,
  className,
  column,
}: DataTableCellProps<TData>) {
  const { sheetId } = useParams();

  const { mutateAsync: setCellSheet } = useSetCellSheet();
  const auth = useAuth((state) => state.auth);

  const [currentValue, setCurrentValue] = React.useState(value);

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
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={(e) => {
              if (!auth) return;
              if (e.key === 'Enter') {
                setCellSheet({
                  nodeAddress: auth.node_address,
                  shinkaiIdentity: auth.shinkai_identity,
                  profile: auth.profile,
                  sheetId: sheetId ?? '',
                  columnId: column.id ?? '',
                  rowId: row.id ?? '',
                  value: currentValue,
                  my_device_encryption_sk: auth.my_device_encryption_sk,
                  my_device_identity_sk: auth.my_device_identity_sk,
                  node_encryption_pk: auth.node_encryption_pk,
                  profile_encryption_sk: auth.profile_encryption_sk,
                  profile_identity_sk: auth.profile_identity_sk,
                });
              }
            }}
            placeholder="Enter prompt"
            value={currentValue}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
