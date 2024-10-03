import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { MixerHorizontalIcon } from '@radix-ui/react-icons';
import { SheetFileFormat } from '@shinkai_network/shinkai-message-ts/api/sheet/types';
import { Columns } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import { useGetSheet } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/useGetSheet';
import { useExportSheet } from '@shinkai_network/shinkai-node-state/v2/mutations/exportSheet/useExportSheet';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { Table } from '@tanstack/react-table';
import { save } from '@tauri-apps/plugin-dialog';
import * as fs from '@tauri-apps/plugin-fs';
import { BaseDirectory } from '@tauri-apps/plugin-fs';
import { Download } from 'lucide-react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { useSheetProjectStore } from './context/table-context';

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
          <svg
            className="h-4 w-4"
            fill="none"
            height="1em"
            stroke="currentColor"
            strokeWidth="0"
            viewBox="0 0 15 15"
            width="1em"
          >
            <path
              clipRule="evenodd"
              d="M3.78233 2.21713C3.70732 2.14212 3.60557 2.09998 3.49949 2.09998C3.3934 2.09998 3.29166 2.14212 3.21664 2.21713L1.21664 4.21713C1.06044 4.37334 1.06044 4.62661 1.21664 4.78282C1.37285 4.93903 1.62612 4.93903 1.78233 4.78282L3.09949 3.46566L3.09949 11.5343L1.78233 10.2171C1.62612 10.0609 1.37285 10.0609 1.21664 10.2171C1.06043 10.3733 1.06043 10.6266 1.21664 10.7828L3.21664 12.7828C3.29166 12.8578 3.3934 12.9 3.49949 12.9C3.60557 12.9 3.70731 12.8578 3.78233 12.7828L5.78233 10.7828C5.93854 10.6266 5.93854 10.3733 5.78233 10.2171C5.62612 10.0609 5.37285 10.0609 5.21664 10.2171L3.89949 11.5343L3.89949 3.46566L5.21664 4.78282C5.37285 4.93903 5.62612 4.93903 5.78233 4.78282C5.93854 4.62661 5.93854 4.37334 5.78233 4.21713L3.78233 2.21713ZM8.49998 3.99997C8.22383 3.99997 7.99998 4.22382 7.99998 4.49997C7.99998 4.77611 8.22383 4.99997 8.49998 4.99997H14.5C14.7761 4.99997 15 4.77611 15 4.49997C15 4.22382 14.7761 3.99997 14.5 3.99997H8.49998ZM7.99998 7.49997C7.99998 7.22382 8.22383 6.99997 8.49998 6.99997H14.5C14.7761 6.99997 15 7.22382 15 7.49997C15 7.77611 14.7761 7.99997 14.5 7.99997H8.49998C8.22383 7.99997 7.99998 7.77611 7.99998 7.49997ZM8.49998 9.99997C8.22383 9.99997 7.99998 10.2238 7.99998 10.5C7.99998 10.7761 8.22383 11 8.49998 11H14.5C14.7761 11 15 10.7761 15 10.5C15 10.2238 14.7761 9.99997 14.5 9.99997H8.49998Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
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
export function DataTableChatOptions() {
  const showChatPanel = useSheetProjectStore((state) => state.showChatPanel);

  const toggleChatPanel = useSheetProjectStore(
    (state) => state.toggleChatPanel,
  );
  return (
    !showChatPanel && (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="hover:bg-brand-gradient hover:text-brand fixed bottom-10 right-10 z-40 flex h-14 w-14 cursor-pointer rounded-full text-white"
              onClick={toggleChatPanel}
              size="icon"
              variant="gradient"
            >
              <span className="sr-only">Chat with Shinkai Sheet</span>
              <svg
                className="h-6 w-6"
                color="currentColor"
                fill="none"
                height="24"
                viewBox="0 0 24 24"
                width="24"
              >
                <path
                  d="M8 13.5H16M8 8.5H12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                />
                <path
                  d="M6.09881 19C4.7987 18.8721 3.82475 18.4816 3.17157 17.8284C2 16.6569 2 14.7712 2 11V10.5C2 6.72876 2 4.84315 3.17157 3.67157C4.34315 2.5 6.22876 2.5 10 2.5H14C17.7712 2.5 19.6569 2.5 20.8284 3.67157C22 4.84315 22 6.72876 22 10.5V11C22 14.7712 22 16.6569 20.8284 17.8284C19.6569 19 17.7712 19 14 19C13.4395 19.0125 12.9931 19.0551 12.5546 19.155C11.3562 19.4309 10.2465 20.0441 9.14987 20.5789C7.58729 21.3408 6.806 21.7218 6.31569 21.3651C5.37769 20.6665 6.29454 18.5019 6.5 17.5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                />
              </svg>
            </Button>
          </TooltipTrigger>
          <TooltipPortal>
            <TooltipContent align="center" side="left" sideOffset={10}>
              <p>Chat with Shinkai Sheet</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    )
  );
}

export function DataTableExportOptions() {
  const { sheetId } = useParams();
  const auth = useAuth((state) => state.auth);

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
  const { mutateAsync: exportSheet } = useExportSheet({
    onSuccess: async (response, variables) => {
      const isCsvFormat = variables.fileFormat === SheetFileFormat.CSV;
      const fileFormat = isCsvFormat ? 'csv' : 'xlsx';

      const path = await save({
        defaultPath: `${sheetInfo?.sheet_name}.${fileFormat}`,
      });

      if (!path) return;
      let fileContent: Uint8Array;
      if (typeof response.content === 'string') {
        const file = new Blob([response.content], {
          type: 'text/csv',
        });
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const fileBuffer = await fetch(dataUrl).then((response) =>
          response.arrayBuffer(),
        );
        fileContent = new Uint8Array(fileBuffer);
      } else {
        fileContent = new Uint8Array(response.content);
      }

      await fs.writeFile(path, fileContent, {
        baseDir: BaseDirectory.Download,
      });
    },
  });
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex h-8 rounded-md" size="sm" variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] bg-gray-300 px-1 py-2 text-gray-50"
      >
        {[SheetFileFormat.CSV, SheetFileFormat.XLSX].map((fileFormat) => (
          <DropdownMenuItem
            key={fileFormat}
            onClick={() => {
              if (!auth || !sheetId) return;
              exportSheet({
                nodeAddress: auth.node_address,
                token: auth.api_v2_key,
                sheetId,
                fileFormat,
              });
            }}
          >
            Export as {fileFormat}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
