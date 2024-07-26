import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import React from 'react';

import { DataTablePagination } from './data-table-pagination';
import { DataTableToolbar } from './data-table-toolbar';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export default function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      location: false,
      otherInformation: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    columnResizeMode: 'onEnd',
    columnResizeDirection: 'ltr',
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
  });

  return (
    <div className="relative h-[calc(100dvh-120px)] overflow-hidden rounded-lg shadow-sm">
      <div className="flex size-full max-w-[calc(100vw-100px)] flex-col space-y-4 overflow-hidden">
        <DataTableToolbar table={table} />
        <div className="scrollbar-thin relative flex size-full h-full flex-col overflow-auto">
          <div className="relative size-full">
            <Table
              className="user-none w-full text-sm"
              style={{
                width: table.getCenterTotalSize(),
              }}
            >
              <TableHeader className="sticky top-0 w-full [&_tr]:border-b">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    className="flex border-b transition-colors hover:bg-transparent [&_th:first-child]:border-l [&_th:last-child]:border-r"
                    key={headerGroup.id}
                  >
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead
                          className={cn(
                            'group relative flex size-full h-10 select-none border-l border-t bg-gray-500 p-1 px-2.5 text-left align-middle font-medium',
                            '[&:has([role=checkbox])]:justify-center [&:has([role=checkbox])]:px-2.5',
                          )}
                          key={header.id}
                          style={{
                            width: header.getSize(),
                          }}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}

                          {header.column.columnDef.id !== 'select' && (
                            <div
                              className={cn(
                                'user-none hover:bg-gray-80 invisible absolute right-1 top-2.5 h-[20px] min-w-1 shrink-0 cursor-col-resize touch-none rounded-lg bg-gray-100 hover:bg-gray-100 group-hover:visible',
                                header.column.getIsResizing() &&
                                  'bg-brand-500 visible top-0 h-[calc(100dvh-250px)] min-w-[3px]',
                              )}
                              {...{
                                onDoubleClick: () => header.column.resetSize(),
                                onMouseDown: header?.getResizeHandler(),
                                onTouchStart: header?.getResizeHandler(),
                                style: {
                                  transform: header.column.getIsResizing()
                                    ? `translateX(${
                                        (table.options.columnResizeDirection ===
                                        'rtl'
                                          ? -1
                                          : 1) *
                                        (table.getState().columnSizingInfo
                                          .deltaOffset ?? 0)
                                      }px)`
                                    : '',
                                },
                              }}
                            />
                          )}
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody className="[&_tr:last-child]:border-0">
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      className={cn(
                        'hover:bg-accent group flex w-full border-b transition-colors [&_td:first-child]:border-l [&_td:last-child]:border-r',
                      )}
                      data-state={row.getIsSelected() && 'selected'}
                      key={row.id}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          className={cn(
                            'flex select-none items-start border-b border-l bg-gray-500 px-2 py-0 text-xs group-hover:bg-gray-300',
                            '[&:has([role=checkbox])]:justify-center [&:has([role=checkbox])]:px-2.5',
                          )}
                          key={cell.id}
                          style={{ width: cell.column.getSize() }}
                        >
                          <div className="w-full text-xs">
                            <div className="line-clamp-1">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </div>
                          </div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      className="h-24 text-center"
                      colSpan={columns.length}
                    >
                      {'No data results'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
