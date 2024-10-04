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
import { ChevronDownIcon } from 'lucide-react';
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
          Export
          <ChevronDownIcon className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] bg-gray-300 px-1 py-2 text-gray-50"
      >
        {[SheetFileFormat.CSV, SheetFileFormat.XLSX].map((fileFormat) => (
          <DropdownMenuItem
            className="gap-2 text-xs font-normal text-gray-50"
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
            {fileFormat === SheetFileFormat.CSV ? (
              <CsvFile className="h-4 w-4" />
            ) : (
              <XlsFile className="h-4 w-4" />
            )}
            Export as {fileFormat.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CsvFile({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill={'none'}
      height={24}
      viewBox="0 0 24 24"
      width={24}
    >
      <path
        d="M8 13L9.70791 15.5M9.70791 15.5L11.4158 18M9.70791 15.5L11.4158 13M9.70791 15.5L8 18M16.5619 18H15.7079C14.9028 18 14.5002 18 14.2501 17.7559C14 17.5118 14 17.119 14 16.3333V13M20.7281 13H19.779C19.3997 13 19.21 13 19.0604 13.0634C18.5577 13.2766 18.5578 13.7739 18.5579 14.2316V14.2684C18.5578 14.7261 18.5577 15.2234 19.0604 15.4366C19.21 15.5 19.3997 15.5 19.779 15.5C20.1583 15.5 20.3479 15.5 20.4975 15.5634C21.0002 15.7766 21.0001 16.2739 21 16.7316V16.7684C21.0001 17.2261 21.0002 17.7234 20.4975 17.9366C20.3479 18 20.1583 18 19.779 18H18.7452"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M15 22H10.7273C7.46607 22 5.83546 22 4.70307 21.2022C4.37862 20.9736 4.09058 20.7025 3.8477 20.3971C3 19.3313 3 17.7966 3 14.7273V12.1818C3 9.21865 3 7.73706 3.46894 6.55375C4.22281 4.65142 5.81714 3.15088 7.83836 2.44135C9.09563 2 10.6698 2 13.8182 2C15.6173 2 16.5168 2 17.2352 2.2522C18.3902 2.65765 19.3012 3.5151 19.732 4.60214C20 5.27832 20 6.12494 20 7.81818V10"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
      <path
        d="M3 12C3 10.1591 4.49238 8.66667 6.33333 8.66667C6.99912 8.66667 7.78404 8.78333 8.43137 8.60988C9.00652 8.45576 9.45576 8.00652 9.60988 7.43136C9.78333 6.78404 9.66667 5.99912 9.66667 5.33333C9.66667 3.49238 11.1591 2 13 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
function XlsFile({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill={'none'}
      height={24}
      viewBox="0 0 24 24"
      width={24}
    >
      <path
        d="M10.2941 15.0163C10.2485 14.0244 9.57068 14 8.65122 14C7.23483 14 7 14.3384 7 15.6667V17.3333C7 18.6616 7.23483 19 8.65122 19C9.57068 19 10.2485 18.9756 10.2941 17.9837M21 14L19.5365 17.9123C19.2652 18.6374 19.1296 19 18.9148 19C18.7 19 18.5644 18.6374 18.2931 17.9123L16.8296 14M14.7214 14H13.7489C13.3602 14 13.1659 14 13.0126 14.0635C12.4906 14.2795 12.4977 14.7873 12.4977 15.25C12.4977 15.7127 12.4906 16.2206 13.0126 16.4366C13.1659 16.5 13.3602 16.5 13.7489 16.5C14.1375 16.5 14.3318 16.5 14.4851 16.5634C15.0071 16.7795 15 17.2873 15 17.75C15 18.2127 15.0071 18.7205 14.4851 18.9366C14.3318 19 14.1375 19 13.7489 19H12.6897"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M19 11C19 10 19 9.4306 18.8478 9.06306C18.6955 8.69552 18.4065 8.40649 17.8284 7.82843L13.0919 3.09188C12.593 2.593 12.3436 2.34355 12.0345 2.19575C11.9702 2.165 11.9044 2.13772 11.8372 2.11401C11.5141 2 11.1614 2 10.4558 2C7.21082 2 5.58831 2 4.48933 2.88607C4.26731 3.06508 4.06508 3.26731 3.88607 3.48933C3 4.58831 3 6.21082 3 9.45584V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H19M12 2.5V3C12 5.82843 12 7.24264 12.8787 8.12132C13.7574 9 15.1716 9 18 9H18.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
