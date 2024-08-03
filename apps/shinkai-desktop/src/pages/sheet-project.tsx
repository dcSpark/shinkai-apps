import { ColumnBehavior } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useSetSheetColumn } from '@shinkai_network/shinkai-node-state/lib/mutations/setSheetColumn/useSetSheetColumn';
import { useGetSheet } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/useGetSheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { generateColumns } from '../components/sheet/columns';
import { fieldTypes } from '../components/sheet/data-table-column-header';
// import { DataTablePagination } from '../components/sheet/data-table-pagination';
// import { DataTableToolbar } from '../components/sheet/data-table-toolbar';
import { generateData } from '../components/sheet/sheet-data';
import { useAuth } from '../store/auth';

const SheetProject = () => {
  const auth = useAuth((state) => state.auth);
  const { sheetId } = useParams();
  const { data: sheetInfo } = useGetSheet({
    nodeAddress: auth?.node_address ?? '',
    sheetId: sheetId ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile: auth?.profile ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
  });

  const { mutateAsync: setSheetColumn } = useSetSheetColumn();

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      location: false,
      otherInformation: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [rowSelection, setRowSelection] = React.useState({});

  const data = useMemo(
    () =>
      generateData(
        sheetInfo?.rows ?? {},
        Object.keys(sheetInfo?.columns ?? {}).length,
      ),
    [sheetInfo?.columns, sheetInfo?.rows],
  );
  const columns = useMemo(
    () => generateColumns(sheetInfo?.columns ?? {}),
    [sheetInfo?.columns],
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    columnResizeMode: 'onEnd',
    columnResizeDirection: 'ltr',
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
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
    <div className="mx-auto h-screen max-w-6xl px-3 py-10 pb-4">
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList className="text-xs">
            <BreadcrumbItem>
              <BreadcrumbLink className="rounded-md px-2.5 py-1.5 hover:bg-gray-300">
                <Link to="/sheets">Dashboard</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>{sheetInfo?.sheet_name}</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="relative h-[calc(100dvh-120px)] overflow-hidden rounded-lg shadow-sm">
        <div className="flex size-full max-w-[calc(100vw-100px)] flex-col space-y-4 overflow-hidden">
          {/*<DataTableToolbar table={table} />*/}
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
                              'group relative flex size-full h-8 select-none border-l border-t bg-gray-500 p-1 px-2.5 text-left align-middle font-medium',
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
                                  'user-none invisible absolute right-1 top-1.5 h-[20px] min-w-1 shrink-0 cursor-col-resize touch-none rounded-lg bg-gray-100 hover:bg-gray-100 group-hover:visible',
                                  header.column.getIsResizing() &&
                                    'bg-brand-500 visible top-0 h-[calc(100dvh-250px)] min-w-[3px]',
                                )}
                                {...{
                                  onDoubleClick: () =>
                                    header.column.resetSize(),
                                  onMouseDown: header?.getResizeHandler(),
                                  onTouchStart: header?.getResizeHandler(),
                                  style: {
                                    transform: header.column.getIsResizing()
                                      ? `translateX(${
                                          (table.options
                                            .columnResizeDirection === 'rtl'
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
                      <DropdownMenu>
                        <TooltipProvider>
                          <Tooltip>
                            <DropdownMenuTrigger asChild>
                              <TooltipTrigger asChild>
                                <button className="text-gray-80 sticky right-0 top-[10px] z-[10] flex h-8 w-8 items-center justify-center gap-2 border border-b-0 bg-gray-500 transition-colors hover:bg-gray-300">
                                  <PlusIcon className="h-5 w-5" />
                                </button>
                              </TooltipTrigger>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent
                              align="end"
                              className="w-[160px] rounded-md bg-gray-300 p-0 px-2 py-2.5 text-gray-50"
                              side="bottom"
                            >
                              {fieldTypes.map((option) => {
                                return (
                                  <button
                                    className="flex w-full gap-2 rounded-lg px-2.5 py-2 text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                                    key={option.id}
                                    onClick={() => {
                                      if (!auth || !sheetId) return;
                                      setSheetColumn({
                                        profile: auth.profile,
                                        nodeAddress: auth.node_address,
                                        sheetId: sheetId,
                                        columnBehavior:
                                          option.id as ColumnBehavior,
                                        columnName: 'New Column',
                                        columnId: undefined,
                                        shinkaiIdentity: auth.shinkai_identity,
                                        my_device_encryption_sk:
                                          auth.my_device_encryption_sk,
                                        my_device_identity_sk:
                                          auth.my_device_identity_sk,
                                        node_encryption_pk:
                                          auth.node_encryption_pk,
                                        profile_encryption_sk:
                                          auth.profile_encryption_sk,
                                        profile_identity_sk:
                                          auth.profile_identity_sk,
                                      });
                                    }}
                                  >
                                    <option.icon className="h-3.5 w-3.5 text-gray-50" />
                                    {option.id}
                                  </button>
                                );
                              })}
                              {/*  */}
                            </DropdownMenuContent>
                            <TooltipPortal>
                              <TooltipContent side="bottom">
                                <p>Add Property</p>
                              </TooltipContent>
                            </TooltipPortal>
                          </Tooltip>
                        </TooltipProvider>
                      </DropdownMenu>
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
                  <button className="text-gray-80 sticky bottom-0 right-0 z-[10] flex w-[calc(100%-40px)] items-center justify-start gap-1 border border-t-0 bg-gray-500 transition-colors hover:bg-gray-300">
                    <span className="flex h-8 w-[50px] items-center justify-center border-r p-1.5">
                      <PlusIcon className="h-full w-full" />
                    </span>
                    <span className="px-2 text-xs">New Entity</span>
                  </button>
                </TableBody>
              </Table>
            </div>
          </div>
          {/*<DataTablePagination table={table} />*/}
        </div>
      </div>
    </div>
  );
};
export default SheetProject;
