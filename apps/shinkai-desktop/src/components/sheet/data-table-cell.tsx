import { PopoverClose } from '@radix-ui/react-popover';
import { useSetCellSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/setCellSheet/useSetCellSheet';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import { AnimatePresence, motion } from 'framer-motion';
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

  const [cellValue, setCellValue] = React.useState(value);

  const handleUpdateCell = async () => {
    if (!auth || !sheetId) return;
    await setCellSheet({
      nodeAddress: auth.node_address,
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      sheetId: sheetId ?? '',
      columnId: column.id ?? '',
      rowId: row.id ?? '',
      value: cellValue,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  const isCellValueChanged = cellValue !== value;

  return (
    <div className={cn('w-full', className)}>
      <Popover
        onOpenChange={async (open) => {
          if (!open) {
            await handleUpdateCell();
          }
        }}
      >
        <PopoverTrigger asChild>
          <div
            className="-ml-1.5 flex h-8 w-full items-center justify-start gap-1.5 rounded-lg bg-transparent px-2 py-1 pr-0"
            role="button"
            tabIndex={0}
          >
            <span className="line-clamp-1 flex-1 text-left text-gray-50">
              {value}
            </span>
          </div>
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
            onChange={(e) => setCellValue(e.target.value)}
            placeholder="Enter prompt"
            value={cellValue}
          />
          <AnimatePresence mode="popLayout">
            {isCellValueChanged && (
              <motion.div
                animate={{ opacity: 1 }}
                className="flex items-center justify-end gap-3 px-3 py-1"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <PopoverClose asChild>
                  <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
                    <span className="">Cancel</span>
                  </button>
                </PopoverClose>
                <PopoverClose asChild>
                  <button
                    className="bg-brand hover:bg-brand-500 flex justify-start gap-2 rounded-lg px-3 py-2 transition-colors"
                    onClick={handleUpdateCell}
                  >
                    <span className="">Save</span>
                  </button>
                </PopoverClose>
              </motion.div>
            )}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </div>
  );
}
