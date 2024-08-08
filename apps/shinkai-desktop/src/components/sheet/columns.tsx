import {
  Columns,
  FormattedRow,
} from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import { Checkbox } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ColumnDef } from '@tanstack/react-table';

import { DataTableCell } from './data-table-cell';
import { DataTableColumnHeader } from './data-table-column-header';
// import { DataTableRowActions } from './data-table-row-actions';

export const generateColumns = (
  columns: Columns,
): ColumnDef<FormattedRow>[] => {
  const formattedColumns = Object.entries(columns).map(([_, value]) => value);

  return [
    {
      id: 'select',
      maxSize: 50,
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            aria-label="Select all"
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="group flex items-center justify-center py-2">
          <Checkbox
            aria-label="Select row"
            checked={row.getIsSelected()}
            className={cn(
              'hidden group-hover:block',
              row.getIsSelected() && 'block',
            )}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
          <span
            className={cn(
              'text-gray-80 block group-hover:hidden',
              row.getIsSelected() && 'hidden',
            )}
          >
            {row.index + 1}
          </span>
        </div>
      ),
      enableHiding: false,
    },
    ...formattedColumns.map((columnItem) => {
      return {
        accessorKey: columnItem.id,
        header: (info) => (
          <DataTableColumnHeader
            column={info.column}
            columnBehavior={columnItem.behavior}
            title={columnItem.name}
          />
        ),
        cell: ({ row, column }) => {
          return (
            <DataTableCell
              column={column}
              row={row}
              status={row.original.fields[column.id]?.status}
              title={columnItem.name}
              value={row.original.fields[column.id]?.value ?? ''}
            />
          );
        },
      } as ColumnDef<FormattedRow>;
    }),
  ];
};
