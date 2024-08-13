import { useGetSheet } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/useGetSheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shinkai_network/shinkai-ui';
import { SheetIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  // getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { generateColumns } from '../components/sheet/columns';
import {
  AddColumnAction,
  AddRowsAction,
  SelectedRowsActions,
} from '../components/sheet/data-table-actions';
import { DataTableToolbar } from '../components/sheet/data-table-toolbar';
import { generateRowsData } from '../components/sheet/sheet-data';
import { getRowHeight } from '../components/sheet/utils';
// import { DataTablePagination } from '../components/sheet/data-table-pagination';
// import { DataTableToolbar } from '../components/sheet/data-table-toolbar';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';

const MotionTableCell = motion(TableCell);

const SheetProject = () => {
  const auth = useAuth((state) => state.auth);
  const heightRow = useSettings((state) => state.heightRow);

  const { sheetId } = useParams();
  const { data: sheetInfo } = useGetSheet(
    {
      nodeAddress: auth?.node_address ?? '',
      sheetId: sheetId ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
    },
    {
      refetchInterval: 5000,
    },
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      location: false,
      otherInformation: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});

  const data = useMemo(
    () =>
      generateRowsData(sheetInfo?.rows ?? {}, sheetInfo?.display_rows ?? []),
    [sheetInfo?.rows, sheetInfo?.display_rows],
  );
  const columns = useMemo(
    () =>
      generateColumns(
        sheetInfo?.columns ?? {},
        sheetInfo?.display_columns ?? [],
      ),
    [sheetInfo?.columns, sheetInfo?.display_columns],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnFilters,
      rowSelection,
      sorting,
    },
    columnResizeMode: 'onChange',
    columnResizeDirection: 'ltr',
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    getFilteredRowModel: getFilteredRowModel(),
    // getPaginationRowModel: getPaginationRowModel(), // enable if we have pagination
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    defaultColumn: {
      size: 200,
      minSize: 50,
      maxSize: 500,
    },
    getRowId: (row) => row.rowId,
  });

  return (
    <div className="mx-auto h-screen max-w-6xl px-3 py-10 pb-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center justify-between">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink
                  asChild
                  className="rounded-md px-2.5 py-1.5 hover:bg-gray-300"
                >
                  <Link className="inline-flex gap-1" to="/sheets">
                    <SheetIcon className="h-4 w-4" />
                    Shinkai Dashboard
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink className="text-white">
                  {sheetInfo?.sheet_name}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <DataTableToolbar columns={sheetInfo?.columns ?? {}} table={table} />
      </div>
      <div className="relative h-[calc(100dvh-120px)] overflow-hidden shadow-sm">
        <div className="flex size-full max-w-[calc(100vw-100px)] flex-col space-y-4 overflow-hidden">
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
                              'group relative flex size-full h-8 select-none border-l border-t bg-gray-500 p-1 pl-2.5 pr-1.5 text-left font-medium',
                              '[&:has([role=checkbox])]:px-[12px] [&:has([role=checkbox])]:pt-2',
                            )}
                            key={header.id}
                            style={{ width: header.getSize() }}
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
                                  'user-none invisible absolute right-0 top-1.5 h-[20px] min-w-1 shrink-0 cursor-col-resize touch-none rounded-lg bg-gray-100 hover:bg-gray-100 group-hover:visible',
                                  header.column.getIsResizing() &&
                                    'bg-brand-500 visible top-0 h-[32px] min-w-[3px]',
                                )}
                                {...{
                                  onDoubleClick: () =>
                                    header.column.resetSize(),
                                  onMouseDown: header?.getResizeHandler(),
                                  onTouchStart: header?.getResizeHandler(),
                                }}
                              />
                            )}
                          </TableHead>
                        );
                      })}
                      <AddColumnAction />
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="[&_tr:last-child]:border-0">
                  {
                    table.getRowModel().rows?.length
                      ? table.getRowModel().rows.map((row) => (
                          <TableRow
                            className={cn(
                              'hover:bg-accent group flex w-full border-b transition-colors [&_td:first-child]:border-l [&_td:last-child]:border-r',
                            )}
                            data-state={row.getIsSelected() && 'selected'}
                            key={row.id}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <MotionTableCell
                                animate={{ height: getRowHeight(heightRow) }}
                                className={cn(
                                  'flex size-full select-none items-start overflow-hidden border-b border-l bg-gray-500 px-2 py-0 pt-[1px] text-xs group-hover:bg-gray-300',
                                  '[&:has([role=checkbox])]:justify-center [&:has([role=checkbox])]:px-3',
                                )}
                                initial={{ height: getRowHeight(heightRow) }}
                                key={cell.id}
                                style={{ width: cell.column.getSize() }}
                              >
                                <div className="size-full text-xs">
                                  {flexRender(
                                    cell.column.columnDef.cell,
                                    cell.getContext(),
                                  )}
                                </div>
                              </MotionTableCell>
                            ))}
                          </TableRow>
                        ))
                      : null
                    // <TableRow>
                    //   <TableCell
                    //     className="h-24 text-center"
                    //     colSpan={
                    //       generateColumns(sheetInfo?.columns ?? {}).length
                    //     }
                    //   >
                    //     {'No data results'}
                    //   </TableCell>
                    // </TableRow>
                  }
                  <AddRowsAction />
                </TableBody>
              </Table>
            </div>
          </div>
          <AnimatePresence>
            {Object.keys(rowSelection).length > 0 ? (
              <SelectedRowsActions
                selectedRows={rowSelection}
                setRowSelection={setRowSelection}
              />
            ) : null}
          </AnimatePresence>
          {/*<DataTablePagination table={table} />*/}
        </div>
      </div>
    </div>
  );
};
export default SheetProject;
