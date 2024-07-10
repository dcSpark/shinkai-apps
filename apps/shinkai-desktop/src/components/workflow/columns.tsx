import { ColumnDef } from '@tanstack/react-table';

import { DataTableColumnHeader } from './data-table-column-header';
// import { DataTableRowActions } from './data-table-row-actions';
import { Book } from './workflow-data';

export const columns: ColumnDef<Book>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={'Title'} />
    ),
    cell: ({ row }) => {
      return <div className="font-medium">{row.getValue('title')}</div>;
    },
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
