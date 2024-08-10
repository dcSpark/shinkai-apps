import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { Columns } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
} from '@shinkai_network/shinkai-ui';
import { Table } from '@tanstack/react-table';
import { FoldVertical } from 'lucide-react';

import { useSettings } from '../../store/settings';

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  columns: Columns;
}

export function DataTableViewOptions<TData>({
  table,
  columns,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex h-8 rounded-md" size="sm" variant="outline">
          <MixerHorizontalIcon className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] bg-gray-300 p-4 text-gray-50"
      >
        <DropdownMenuLabel className="text-gray-80 mb-2 px-2 text-xs">
          Visible
        </DropdownMenuLabel>
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== 'undefined' && column.getCanHide(),
          )
          .map((column) => {
            return (
              <DropdownMenuCheckboxItem
                checked={column.getIsVisible()}
                className="text-xs capitalize"
                key={column.id}
                onCheckedChange={(value) => column.toggleVisibility(!!value)}
              >
                {columns?.[column.id]?.name ?? column.id}
              </DropdownMenuCheckboxItem>
            );
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
export function DataTableHeightOptions<TData>(
  // eslint-disable-next-line no-empty-pattern
  {
    // table,
    // columns,
  }: DataTableViewOptionsProps<TData>,
) {
  const setHeightRow = useSettings((state) => state.setHeightRow);
  const heightRow = useSettings((state) => state.heightRow);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex h-8 rounded-md" size="icon" variant="outline">
          <FoldVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] bg-gray-300 p-4 text-gray-50"
      >
        <DropdownMenuLabel className="text-gray-80 mb-2 px-2 text-xs">
          Row Height
        </DropdownMenuLabel>
        {(
          ['small', 'medium', 'large', 'extra-large'] as (
            | 'small'
            | 'medium'
            | 'large'
            | 'extra-large'
          )[]
        ).map((height) => {
          return (
            <DropdownMenuCheckboxItem
              checked={heightRow === height}
              className="text-xs capitalize"
              key={height}
              onCheckedChange={() => setHeightRow(height)}
            >
              {height}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
