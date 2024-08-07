import { Cross2Icon } from '@radix-ui/react-icons';
import { Button } from '@shinkai_network/shinkai-ui';
import { Table } from '@tanstack/react-table';

import { DataTableViewOptions } from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
}

export function DataTableToolbar<TData>({
  table,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex w-full items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/*<div className="relative flex h-10 w-full max-w-[300px] flex-1 items-center">*/}
        {/*  <Input*/}
        {/*    className="placeholder-gray-80 !h-full bg-transparent py-2 pl-10 text-xs"*/}
        {/*    onChange={(event) =>*/}
        {/*      table.getColumn('title')?.setFilterValue(event.target.value)*/}
        {/*    }*/}
        {/*    placeholder={'Search by Name'}*/}
        {/*    value={(table.getColumn('title')?.getFilterValue() as string) ?? ''}*/}
        {/*  />*/}
        {/*  <SearchIcon className="absolute left-4 top-1/2 -z-[1px] h-4 w-4 -translate-y-1/2" />*/}
        {/*</div>*/}

        {isFiltered && (
          <Button
            className="h-8 px-2 text-xs lg:px-3"
            onClick={() => table.resetColumnFilters()}
            variant="outline"
          >
            {'Clean Filters'}
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
