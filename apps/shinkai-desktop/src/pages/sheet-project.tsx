import { zodResolver } from '@hookform/resolvers/zod';
import { ColumnStatus } from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { buildInboxIdFromJobId } from '@shinkai_network/shinkai-message-ts/utils';
import { ShinkaiMessageBuilderWrapper } from '@shinkai_network/shinkai-message-ts/wasm/ShinkaiMessageBuilderWrapper';
import { CreateJobFormSchema, createJobFormSchema } from '@shinkai_network/shinkai-node-state/forms/chat/create-job';
import { FunctionKey } from '@shinkai_network/shinkai-node-state/lib/constants';
import { useCreateJob } from '@shinkai_network/shinkai-node-state/lib/mutations/createJob/useCreateJob';
import { useSendMessageToJob } from '@shinkai_network/shinkai-node-state/lib/mutations/sendMessageToJob/useSendMessageToJob';
import { useGetChatConversationWithPagination } from '@shinkai_network/shinkai-node-state/lib/queries/getChatConversation/useGetChatConversationWithPagination';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import { Sheet } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import { useGetSheet } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/useGetSheet';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
  Button,
  Input,
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@shinkai_network/shinkai-ui';
import { SheetIcon } from '@shinkai_network/shinkai-ui/assets';
import { useClickAway } from '@shinkai_network/shinkai-ui/hooks';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from '@tanstack/react-table';
import { AnimatePresence, motion } from 'framer-motion';
import { SendIcon, XIcon } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import useWebSocket from 'react-use-websocket';

import { generateColumns } from '../components/sheet/columns';
import { useSheetProjectStore } from '../components/sheet/context/table-context';
import {
  AddColumnAction,
  AddRowsAction,
  SelectedRowsActions,
} from '../components/sheet/data-table-actions';
import { DataTableToolbar } from '../components/sheet/data-table-toolbar';
import { generateRowsData } from '../components/sheet/sheet-data';
import { getRowHeight } from '../components/sheet/utils';
import { useTableMenuActions } from '../components/sheet/utils/copy-paste';
import useTableHotkeys from '../components/sheet/utils/use-table-hotkeys';
// import { DataTablePagination } from '../components/sheet/data-table-pagination';
// import { DataTableToolbar } from '../components/sheet/data-table-toolbar';
import { useAuth } from '../store/auth';
import { useSettings } from '../store/settings';

const MotionTableCell = motion(TableCell);

const useWebsocketUpdateCell = ({ enabled }: { enabled: boolean }) => {
  const auth = useAuth((state) => state.auth);
  const nodeAddressUrl = new URL(auth?.node_address ?? 'http://localhost:9850');
  const socketUrl = `ws://${nodeAddressUrl.hostname}:${Number(nodeAddressUrl.port) + 1}/ws`;
  const { sheetId } = useParams();

  const queryClient = useQueryClient();
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    socketUrl,
    {},
    enabled,
  );

  useEffect(() => {
    if (!enabled || !auth) return;
    if (lastMessage?.data) {
      try {
        const parseData: {
          message_type: 'Stream' | 'ShinkaiMessage' | 'Sheet';
          inbox: string;
          message: string;
          error_message: string;
          metadata?: {
            id: string;
            is_done: boolean;
            done_reason: string;
            total_duration: number;
            eval_count: number;
          };
        } = JSON.parse(lastMessage.data);

        if (parseData.message_type === 'Sheet') {
          const cellDataParsed: {
            data: {
              column_id: string;
              input_hash: null;
              last_updated: string;
              row_id: string;
              status: 'Pending' | 'Ready';
              value: string;
            };
            sheetId: string;
            updated_type: 'CellUpdated';
          } = JSON.parse(parseData.message);

          const queryKey = [
            FunctionKey.GET_SHEET,
            {
              nodeAddress: auth?.node_address,
              sheetId: sheetId,
              profile_encryption_sk: auth?.profile_encryption_sk ?? '',
              profile_identity_sk: auth?.profile_identity_sk ?? '',
              my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
              my_device_identity_sk: auth?.my_device_identity_sk ?? '',
              node_encryption_pk: auth?.node_encryption_pk ?? '',
              profile: auth?.profile ?? '',
              shinkaiIdentity: auth?.shinkai_identity ?? '',
            },
          ];

          queryClient.setQueryData(queryKey, (prev: Sheet) => {
            const newSheetData = structuredClone(prev);
            const cell =
              newSheetData.rows[cellDataParsed.data.row_id]?.[
                cellDataParsed.data.column_id
              ];
            cell.value = cellDataParsed.data.value;
            cell.status = cellDataParsed.data.status as ColumnStatus;
            cell.last_updated = cellDataParsed.data.last_updated;
            return newSheetData;
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [auth, enabled, lastMessage?.data, queryClient, readyState, sheetId]);

  useEffect(() => {
    if (!enabled) return;
    const wsMessage = {
      subscriptions: [{ topic: 'sheet', subtopic: '' }],
      unsubscriptions: [],
    };
    const wsMessageString = JSON.stringify(wsMessage);
    const shinkaiMessage = ShinkaiMessageBuilderWrapper.ws_connection(
      wsMessageString,
      auth?.profile_encryption_sk ?? '',
      auth?.profile_identity_sk ?? '',
      auth?.node_encryption_pk ?? '',
      auth?.shinkai_identity ?? '',
      auth?.profile ?? '',
      '',
      '',
    );
    sendMessage(shinkaiMessage);
  }, [
    auth?.node_encryption_pk,
    auth?.profile,
    auth?.profile_encryption_sk,
    auth?.profile_identity_sk,
    auth?.shinkai_identity,
    enabled,
    sendMessage,
  ]);
};

const SheetProject = () => {
  const auth = useAuth((state) => state.auth);
  const heightRow = useSettings((state) => state.heightRow);
  const selectedCell = useSheetProjectStore((state) => state.selectedCell);
  const setSelectedCell = useSheetProjectStore(
    (state) => state.setSelectedCell,
  );
  const showChatPanel = useSheetProjectStore((state) => state.showChatPanel);
  const setSheetId = useSheetProjectStore((state) => state.setSheetId);
  const { sheetId } = useParams();

  useEffect(() => {
    if (sheetId) {
      setSheetId(sheetId); // Set the sheetId in the store
    }
  }, [sheetId]);

  useWebsocketUpdateCell({ enabled: true });

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

  const { rows } = table.getRowModel();
  const leafColumns = table.getVisibleLeafColumns();

  useTableHotkeys({ rows, leafColumns });

  const tableRef = useTableMenuActions({
    selectedCell,
    rows,
    leafColumns,
  });

  const tableBodyRef = useClickAway<HTMLTableSectionElement>(() => {
    setSelectedCell(null);
  });

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
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
            <DataTableToolbar
              columns={sheetInfo?.columns ?? {}}
              table={table}
            />
          </div>
          <div className="relative h-[calc(100dvh-120px)] overflow-hidden shadow-sm">
            <div className="flex size-full max-w-[calc(100vw-100px)] flex-col space-y-4 overflow-hidden">
              <div className="scrollbar-thin relative flex size-full h-full flex-col overflow-auto">
                <div className="relative size-full">
                  <Table
                    className="user-none w-full text-sm"
                    ref={tableRef}
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
                    <TableBody
                      className="[&_tr:last-child]:border-0"
                      ref={tableBodyRef}
                    >
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
                                {row.getVisibleCells().map((cell) => {
                                  return (
                                    <MotionTableCell
                                      animate={{
                                        height: getRowHeight(heightRow),
                                      }}
                                      className={cn(
                                        'flex size-full select-none items-start border-b border-l bg-gray-500 px-0 py-0 pt-[1px] text-xs group-hover:bg-gray-300',
                                        '[&:has([role=checkbox])]:justify-center [&:has([role=checkbox])]:px-3',
                                      )}
                                      initial={{
                                        height: getRowHeight(heightRow),
                                      }}
                                      key={cell.id}
                                      style={{ width: cell.column.getSize() }}
                                    >
                                      <div className={cn('size-full text-xs')}>
                                        {flexRender(
                                          cell.column.columnDef.cell,
                                          cell.getContext(),
                                        )}
                                      </div>
                                    </MotionTableCell>
                                  );
                                })}
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
      </ResizablePanel>
      {showChatPanel && <ResizableHandle className="bg-gray-300" />}
      <ResizablePanel
        className={cn(!showChatPanel ? 'hidden' : 'block')}
        collapsible
        defaultSize={36}
        maxSize={36}
        minSize={30}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {showChatPanel && (
            <motion.div
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              className="h-full"
              initial={{ opacity: 0, filter: 'blur(5px)' }}
              transition={{ duration: 0.2 }}
            >
              <ChatPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
export default SheetProject;

function ChatPanel() {
  const toggleChatPanel = useSheetProjectStore(
    (state) => state.toggleChatPanel,
  );
  const [inputValue, setInputValue] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const { t } = useTranslation();
  const auth = useAuth((state) => state.auth);
  const defaulAgentId = useSettings((state) => state.defaultAgentId);
  const { sheetId } = useParams();

  const createJobForm = useForm<CreateJobFormSchema>({
    resolver: zodResolver(createJobFormSchema),
    defaultValues: {
      files: [],
    },
  });

  const { llmProviders, isSuccess } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    sender: auth?.shinkai_identity ?? '',
    senderSubidentity: `${auth?.profile}`,
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });

  const { isPending, mutateAsync: createJob } = useCreateJob({
    onSuccess: (data) => {
      setJobId(data.jobId);
    },
  });

  const { mutateAsync: sendMessageToJob } = useSendMessageToJob();

  const { data: messagesData, refetch: refetchMessages } = useGetChatConversationWithPagination({
    nodeAddress: auth?.node_address ?? '',
    inboxId: jobId ? buildInboxIdFromJobId(jobId) : '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
    my_device_identity_sk: auth?.profile_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
    refetchIntervalEnabled: !!jobId,
  });


  useEffect(() => {
    if (isSuccess && llmProviders?.length && !defaulAgentId) {
      createJobForm.setValue('agent', llmProviders[0].id);
    } else {
      createJobForm.setValue('agent', defaulAgentId);
    }
  }, [llmProviders, createJobForm, defaulAgentId, isSuccess]);

  useEffect(() => {
    console.log('sheetId:', sheetId);
    const createInitialJob = async () => {
      if (!auth || !sheetId) return;
      await createJob({
        nodeAddress: auth?.node_address ?? '',
        shinkaiIdentity: auth.shinkai_identity,
        profile: auth.profile,
        agentId: createJobForm.getValues('agent'),
        content: '',
        files_inbox: '',
        files: [],
        workflow: undefined,
        workflowName: undefined,
        is_hidden: false,
        selectedVRFiles: [],
        selectedVRFolders: [],
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
        associated_ui: { type: 'Sheet', value: sheetId },
      });
    };

    createInitialJob();
  }, [auth, createJob, createJobForm, sheetId]);

  const handleSendClick = async () => {
    console.log('handleSendClick');
    if (!auth) return;
    if (inputValue.trim() && jobId) {
      try {
        await sendMessageToJob({
          nodeAddress: auth?.node_address ?? '',
          jobId: jobId,
          message: inputValue,
          files_inbox: '',
          parent: '',
          shinkaiIdentity: auth.shinkai_identity,
          profile: auth.profile,
          workflowName: undefined,
          my_device_encryption_sk: auth.my_device_encryption_sk,
          my_device_identity_sk: auth.my_device_identity_sk,
          node_encryption_pk: auth.node_encryption_pk,
          profile_encryption_sk: auth.profile_encryption_sk,
          profile_identity_sk: auth.profile_identity_sk,
        });
        // Clear the input after sending
        setInputValue('');
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  return (
    <div className="flex h-full flex-col gap-10 p-5 px-4 py-8">
      <Button
        className="absolute right-4 top-4"
        onClick={toggleChatPanel}
        size="icon"
        variant="tertiary"
      >
        <XIcon className="text-gray-80 h-5 w-5" />
      </Button>
      <h1>Ask Shinkai AI</h1>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 overflow-y-auto text-center">
        <span aria-hidden className="text-5xl">
          🤖
        </span>
        <h2 className="text-lg font-medium">Chat with your Shinkai Sheet</h2>
        <p className="text-gray-80 text-sm">
          Try "Generate top 10 tech startups", "Set up a shinkai sheet", “Create
          a new colum", “Add a new row”
        </p>
        <div className="flex flex-col gap-2">
          {messagesData?.pages?.map((page) =>
            page.map((message) => (
              <div className="text-left" key={message.hash}>
                {message.content}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Input
          autoFocus
          className="placeholder-gray-80 !h-[50px] flex-1 bg-gray-200 px-3 py-2"
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={'Ask Shinkai AI'}
          value={inputValue}
        />
        <Button
          className="aspect-square h-[90%] shrink-0 rounded-lg p-2"
          onClick={handleSendClick}
          size="auto"
          variant="default"
        >
          <SendIcon className="h-4.5 w-4.5" />
        </Button>
      </div>
    </div>
  );
}
