import {
  Columns,
  Row,
} from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import { Checkbox } from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ColumnDef } from '@tanstack/react-table';

import { DataTableCell } from './data-table-cell';
import { DataTableColumnHeader } from './data-table-column-header';
// import { DataTableRowActions } from './data-table-row-actions';

export const generateColumns = (columns: Columns): ColumnDef<Row>[] => {
  const formattedColumns = Object.entries(columns).map(([_, value]) => value);
  console.log(formattedColumns, 'formattedColumns');

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
        // @ts-expect-error to fix
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            columnBehavior={columnItem.behavior}
            title={columnItem.name}
          />
        ),
        // @ts-expect-error to fix
        cell: ({ row }) => {
          return (
            <DataTableCell
              row={row}
              title={columnItem.name}
              value={row.original[columnItem.id]?.value ?? 'Waiting for ...'}
            />
          );
        },
      };
    }),
    //////////////////////////////////
    // {
    //   accessorKey: 'title',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={'Title'} />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <DataTableCell row={row} title={'Title'} value={row.original.title} />
    //     );
    //   },
    // },
    // {
    //   accessorKey: 'author',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={'Author'} />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <DataTableCell
    //         row={row}
    //         title={'Author'}
    //         value={row.original.author}
    //       />
    //     );
    //   },
    // },
    // {
    //   accessorKey: 'yearReleased',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={'Year'} />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <DataTableCell
    //         row={row}
    //         title={'Year'}
    //         value={row.original.yearReleased.toString()}
    //       />
    //     );
    //   },
    // },
    // {
    //   accessorKey: 'pages',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={'# Pages'} />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <DataTableCell
    //         row={row}
    //         title={'# Pages'}
    //         value={row.original.pages.toString()}
    //       />
    //     );
    //   },
    // },
    // {
    //   accessorKey: 'genre',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={'Genre'} />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <DataTableCell row={row} title={'Genre'} value={row.original.genre} />
    //     );
    //   },
    // },
    //
    // {
    //   accessorKey: 'summary',
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title={'Summary'} />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <DataTableCell
    //         row={row}
    //         title={'Summary'}
    //         value={row.original.summary}
    //       />
    //     );
    //   },
    // },
  ];
};
