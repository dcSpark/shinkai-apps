import {
  Columns,
  FormattedRow,
} from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import { Checkbox } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ColumnDef } from '@tanstack/react-table';

import { DataTableCell } from './data-table-cell';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTableRowDetails } from './data-table-row-details';
// import { DataTableRowActions } from './data-table-row-actions';

export const generateColumns = (
  columns: Columns,
  display_columns: string[],
): ColumnDef<FormattedRow>[] => {
  // TODO: remove the following line after fixing the display_columns in the node api
  const uniqueDisplayColumns = display_columns.filter(
    (item, index) => display_columns.indexOf(item) === index,
  );
  const formattedColumns = uniqueDisplayColumns
    .map((id) => ({
      ...columns[id],
      columnLetter: String.fromCharCode(65 + uniqueDisplayColumns.indexOf(id)),
    }))
    .filter(Boolean);

  return [
    {
      id: 'select',
      maxSize: 74,
      header: ({ table }) => (
        <div className="h-4 w-4 justify-self-start">
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
        <div className="group flex size-full items-center gap-2">
          <div className="flex h-4 w-4 items-center justify-center py-2">
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
          <span className="invisible group-hover:visible">
            <DataTableRowDetails columns={columns} row={row} />
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
            columnLetter={columnItem.columnLetter}
            title={columnItem.name}
          />
        ),
        cell: ({ row, column }) => {
          return (
            <DataTableCell
              column={column}
              columnBehavior={columnItem.behavior}
              row={row}
              status={row.original.fields[column.id]?.status}
              title={columnItem.name}
              value={row.original.fields[column.id]?.value ?? ''}
            />
          );
        },
        sortingFn: (a, b) => {
          const aVal = a.original.fields[columnItem.id]?.value ?? '';
          const bVal = b.original.fields[columnItem.id]?.value ?? '';
          return aVal.localeCompare(bVal);
        },
      } as ColumnDef<FormattedRow>;
    }),
  ];
};
