import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shinkai_network/shinkai-ui';
import { Row } from '@tanstack/react-table';
import { Eye, Pencil, Trash2 } from 'lucide-react';

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

// @ts-expect-error aaa
export function DataTableRowActions<TData>({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  row,
}: DataTableRowActionsProps<TData>) {
  // const user = UserSchema.parse(row.original);
  // console.log(user.id); // Note: use the id for any action (example: delete, view, edit)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          variant="ghost"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">{'Open Menu'}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Button
            // asChild
            className={'w-full justify-start'}
            size={'sm'}
            variant={'tertiary'}
          >
            <Eye className="h-4 w-4 text-blue-500" />
            <span className="ml-2">{'View'}</span>
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Button
            // asChild
            className={'w-full justify-start'}
            size={'sm'}
            variant={'tertiary'}
          >
            <Pencil className="h-4 w-4 text-green-500" />
            <span className="ml-2">{'Update'}</span>
          </Button>
        </DropdownMenuItem>

        <DropdownMenuItem>
          <Button
            className={'w-full justify-start'}
            size={'sm'}
            variant={'tertiary'}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
            <span className="ml-2">{'Delete'}</span>
          </Button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
