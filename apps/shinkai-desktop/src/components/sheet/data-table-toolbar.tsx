// import { Cross2Icon } from '@radix-ui/react-icons';
// import { Button } from '@shinkai_network/shinkai-ui';
// import { Cross2Icon } from '@radix-ui/react-icons';
import { Columns } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
// import { Button } from '@shinkai_network/shinkai-ui';
import { Table } from '@tanstack/react-table';

// import { SortAltIcon } from 'primereact/icons/sortalt';
import {
  DataTableChatOptions,
  DataTableHeightOptions,
  DataTableViewOptions,
} from './data-table-view-options';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  columns: Columns;
}

export function DataTableToolbar<TData>({
  table,
  columns,
}: DataTableToolbarProps<TData>) {
  // const isFiltered = table.getState().columnFilters.length > 0;
  // const sortingState = table.getState().sorting;

  return (
    <div className="flex items-center gap-3">
      {/*<div className="flex flex-1 items-center space-x-2">*/}
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

      {/*{sortingState.length > 0 && (*/}
      {/*  <Button*/}
      {/*    className="h-8 px-2 text-xs lg:px-3"*/}
      {/*    onClick={() => table.resetSorting()}*/}
      {/*    size="auto"*/}
      {/*    variant="outline"*/}
      {/*  >*/}
      {/*    /!*<SortAltIcon className="mr-2 h-3 w-3" />*!/*/}
      {/*    Sorted By {sortingState.length} field*/}
      {/*    <Cross2Icon className="ml-2 h-3 w-3" />*/}
      {/*  </Button>*/}
      {/*)}*/}
      {/*</div>*/}
      <DataTableChatOptions />
      <DataTableHeightOptions columns={columns} table={table} />
      <DataTableViewOptions columns={columns} table={table} />
    </div>
  );
}
