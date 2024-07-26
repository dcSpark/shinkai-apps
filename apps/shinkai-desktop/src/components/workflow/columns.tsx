import { Checkbox } from '@shinkai_network/shinkai-ui';
import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from './data-table-column-header';
// import { DataTableRowActions } from './data-table-row-actions';
import { Book } from './workflow-data';

export const columns: ColumnDef<Book>[] = [
  {
    id: 'select',
    maxSize: 50,
    header: ({ table }) => (
      <div className="h-full py-1.5">
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <Checkbox
        aria-label="Select row"
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={'Title'} />
    ),
  },
  {
    accessorKey: 'author',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={'Author'} />
    ),
  },
  {
    accessorKey: 'yearReleased',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={'Year'} />
    ),
  },
  {
    accessorKey: 'pages',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={'# Pages'} />
    ),
  },
  {
    accessorKey: 'genre',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={'Genre'} />
    ),
  },

  {
    accessorKey: 'summary',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={'Summary'} />
    ),
  },
  // {
  //   id: 'actions',
  //   cell: ({ row }) => <DataTableRowActions row={row} />,
  // },
];
