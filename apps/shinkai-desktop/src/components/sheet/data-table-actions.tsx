import { PopoverClose } from '@radix-ui/react-popover';
import {
  ColumnBehavior,
  ColumnType,
  Workflow,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useAddRowsSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/addRowsSheet/useAddRowsSheet';
import { useRemoveRowsSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/removeRowsSheet/useRemoveRowsSheet';
import { useSetColumnSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/setColumnSheet/useSetColumnSheet';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowList/useGetWorkflowList';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Textarea,
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { WorkflowPlaygroundIcon } from '@shinkai_network/shinkai-ui/assets';
import { RowSelectionState } from '@tanstack/react-table';
import { BotIcon, ChevronRight, PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth';
import { fieldTypes } from './data-table-column-header';

interface DataTableActionsProps {
  selectedRows: RowSelectionState;
  setRowSelection: (selectedRows: RowSelectionState) => void;
}
export function SelectedRowsActions({
  selectedRows,
  setRowSelection,
}: DataTableActionsProps) {
  const auth = useAuth((state) => state.auth);
  const { sheetId } = useParams();
  const { mutateAsync: removeRowsSheet } = useRemoveRowsSheet({
    onSuccess: () => {
      setRowSelection({});
      toast.success('Rows deleted successfully');
    },
  });

  return (
    <div className="outline-border z-5 absolute bottom-0 left-1/2 inline-flex -translate-x-1/2 items-center overflow-hidden rounded-xl bg-gray-400 px-2 py-2 shadow-lg outline outline-1 outline-gray-200">
      <div className="rounded-lg pl-3 pr-4 pt-px text-xs">
        {Object.keys(selectedRows).length} selected{' '}
      </div>
      <Button
        className="!h-[32px] min-w-[80px] rounded-md"
        onClick={async () => {
          await removeRowsSheet({
            nodeAddress: auth?.node_address ?? '',
            shinkaiIdentity: auth?.shinkai_identity ?? '',
            profile: auth?.profile ?? '',
            sheetId: sheetId ?? '',
            rowIds: Object.keys(selectedRows),
            my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
            my_device_identity_sk: auth?.my_device_identity_sk ?? '',
            node_encryption_pk: auth?.node_encryption_pk ?? '',
            profile_encryption_sk: auth?.profile_encryption_sk ?? '',
            profile_identity_sk: auth?.profile_identity_sk ?? '',
          });
        }}
        size="sm"
      >
        Delete
      </Button>
    </div>
  );
}

export function AddRowsAction() {
  const auth = useAuth((state) => state.auth);
  const { mutateAsync: addRowsSheet } = useAddRowsSheet({});
  const { sheetId } = useParams();
  const handleAddRow = async () => {
    await addRowsSheet({
      nodeAddress: auth?.node_address ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      profile: auth?.profile ?? '',
      sheetId: sheetId ?? '',
      numberOfRows: 1,
      startingRow: undefined,
      my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
      my_device_identity_sk: auth?.my_device_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    });
  };

  return (
    <button
      className="text-gray-80 sticky bottom-0 right-0 z-[10] flex w-[calc(100%-32px)] min-w-[180px] items-center justify-start gap-1 border border-t-0 bg-gray-500 transition-colors hover:bg-gray-300"
      onClick={handleAddRow}
    >
      <span className="flex h-8 w-[50px] shrink-0 items-center justify-center border-r p-1.5">
        <PlusIcon className="h-full w-full" />
      </span>
      <span className="px-2 text-xs">New Entity</span>
    </button>
  );
}
export function AddColumnAction() {
  const { sheetId } = useParams();
  const auth = useAuth((state) => state.auth);

  const [selectedType, setSelectedType] = useState(fieldTypes[0]);

  const { llmProviders } = useGetLLMProviders({
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

  const { data: workflowList } = useGetWorkflowList({
    nodeAddress: auth?.node_address ?? '',
    shinkaiIdentity: auth?.shinkai_identity ?? '',
    profile: auth?.profile ?? '',
    my_device_encryption_sk: auth?.my_device_encryption_sk ?? '',
    my_device_identity_sk: auth?.my_device_identity_sk ?? '',
    node_encryption_pk: auth?.node_encryption_pk ?? '',
    profile_encryption_sk: auth?.profile_encryption_sk ?? '',
    profile_identity_sk: auth?.profile_identity_sk ?? '',
  });
  const [columnName, setColumnName] = useState('');
  const [selectedAgent, setSelectedAgent] = useState(llmProviders[0]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<
    Workflow | undefined
  >(undefined);

  const [formula, setFormula] = useState('');
  const [promptInput, setPromptInput] = useState('');

  const { mutateAsync: setColumnSheet } = useSetColumnSheet({
    onSuccess: () => {
      resetState();
    },
  });

  const generateColumnBehavior = (columnType: ColumnType): ColumnBehavior => {
    switch (columnType) {
      case ColumnType.Text:
        return ColumnType.Text;
      case ColumnType.Number:
        return ColumnType.Number;
      case ColumnType.Formula:
        return { [ColumnType.Formula]: formula };
      case ColumnType.LLMCall:
        return {
          [ColumnType.LLMCall]: {
            input: promptInput,
            workflow: {
              description: selectedWorkflow?.description ?? '',
              name: selectedWorkflow?.name ?? '',
              raw: selectedWorkflow?.raw ?? '',
              version: selectedWorkflow?.version ?? '',
              steps: selectedWorkflow?.steps ?? [],
              author: selectedWorkflow?.author ?? '',
              sticky: selectedWorkflow?.sticky ?? false,
            },
            llm_provider_name: selectedAgent.id,
          },
        };
      case ColumnType.MultipleVRFiles:
        return {
          [ColumnType.MultipleVRFiles]: {
            input: promptInput,
            workflow: {
              description: selectedWorkflow?.description ?? '',
              name: selectedWorkflow?.name ?? '',
              raw: selectedWorkflow?.raw ?? '',
              version: selectedWorkflow?.version ?? '',
              steps: selectedWorkflow?.steps ?? [],
              author: selectedWorkflow?.author ?? '',
              sticky: selectedWorkflow?.sticky ?? false,
            },
            llm_provider_name: selectedAgent.id,
          },
        };
      case ColumnType.UploadedFiles:
        return {
          [ColumnType.UploadedFiles]: {
            files: [''],
          },
        };
      default:
        return ColumnType.Text;
    }
  };

  const handleAddColumn = async () => {
    if (!auth || !sheetId) return;
    await setColumnSheet({
      profile: auth.profile,
      nodeAddress: auth.node_address,
      sheetId: sheetId,
      columnBehavior: generateColumnBehavior(selectedType.id),
      columnName: columnName,
      columnId: undefined,
      shinkaiIdentity: auth.shinkai_identity,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  const resetState = () => {
    setColumnName('');
    setSelectedType(fieldTypes[0]);
    setSelectedAgent(llmProviders[0]);
    setSelectedWorkflow(workflowList?.[0]);
  };

  return (
    <Popover>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <PopoverTrigger asChild>
            <TooltipTrigger asChild>
              <button className="text-gray-80 sticky right-0 top-[10px] z-[10] flex h-8 w-8 items-center justify-center gap-2 border border-b-0 bg-gray-500 transition-colors hover:bg-gray-300">
                <PlusIcon className="h-5 w-5" />
              </button>
            </TooltipTrigger>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex flex-col bg-gray-300 px-0 py-2 text-xs"
          >
            <div className="px-3 py-1 text-left text-xs font-medium">
              <Input
                autoFocus
                className="placeholder-gray-80 !h-[40px] resize-none border-none bg-gray-200 py-0 pl-2 pt-0 text-xs caret-white focus-visible:ring-0 focus-visible:ring-white"
                onChange={(e) => setColumnName(e.target.value)}
                placeholder={'Column Name'}
                value={columnName}
              />
            </div>
            <Separator className="my-1 bg-gray-200" orientation="horizontal" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
                  <span className="text-gray-80">Type</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 text-gray-50">
                      {selectedType && (
                        <selectedType.icon className="h-3.5 w-3.5 text-gray-50" />
                      )}

                      {selectedType?.label ?? 'Select'}
                    </span>
                    <ChevronRight className="text-gray-80 h-3.5 w-3.5" />
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                className="w-[180px] rounded-md bg-gray-300 p-0 px-2 py-2.5 text-gray-50"
                side="right"
              >
                {fieldTypes.map((option) => {
                  return (
                    <DropdownMenuCheckboxItem
                      checked={selectedType.id === option.id}
                      className="flex gap-2 text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                      key={option.id}
                      onCheckedChange={() => setSelectedType(option)}
                    >
                      <option.icon className="h-3.5 w-3.5 shrink-0 text-gray-50" />
                      {option.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
            {(selectedType.id === ColumnType.LLMCall ||
              selectedType.id === ColumnType.MultipleVRFiles) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
                    <span className="text-gray-80">AI</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-gray-50">
                        <BotIcon className="h-3.5 w-3.5" />
                        {selectedAgent?.id ?? 'Select'}
                      </span>
                      <ChevronRight className="text-gray-80 h-3.5 w-3.5" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="w-[160px] rounded-md bg-gray-300 p-0 px-2 py-2.5 text-gray-50"
                  side="right"
                >
                  {llmProviders.map((option) => {
                    return (
                      <DropdownMenuCheckboxItem
                        checked={option.id === selectedAgent?.id}
                        className="flex gap-2 text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                        key={option.id}
                        onCheckedChange={() => setSelectedAgent(option)}
                      >
                        {option.id}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {selectedType.id === ColumnType.Formula && (
              <div className="px-3 py-1 text-left text-xs font-medium">
                <Input
                  autoFocus
                  className="placeholder-gray-80 !h-[40px] resize-none border-none bg-gray-200 py-0 pl-2 pt-0 text-xs caret-white focus-visible:ring-0 focus-visible:ring-white"
                  onChange={(e) => setFormula(e.target.value)}
                  placeholder={'Formula'}
                  value={formula}
                />
              </div>
            )}
            {(selectedType.id === ColumnType.LLMCall ||
              selectedType.id === ColumnType.MultipleVRFiles) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
                    <span className="text-gray-80">Workflow</span>
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 text-gray-50">
                        <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                        {selectedWorkflow?.name ?? 'select'}
                      </span>
                      <ChevronRight className="text-gray-80 h-3.5 w-3.5" />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-[40vh] w-[240px] overflow-auto rounded-md bg-gray-300 p-0 px-2 py-2.5 text-gray-50"
                  side="right"
                >
                  {workflowList?.map((option) => {
                    return (
                      <DropdownMenuCheckboxItem
                        checked={option.name === selectedWorkflow?.name}
                        className="flex gap-2 truncate text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                        key={option.name}
                        onCheckedChange={() => setSelectedWorkflow(option)}
                      >
                        {option.name}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {(selectedType.id === ColumnType.LLMCall ||
              selectedType.id === ColumnType.MultipleVRFiles) && (
              <div className="flex justify-between gap-2 px-2 py-2">
                <Textarea
                  autoFocus
                  className="placeholder-gray-80 !min-h-[100px] resize-none bg-gray-200 pl-2 pt-2 text-xs"
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Enter prompt"
                  value={promptInput}
                />
              </div>
            )}
            <Separator className="my-1 bg-gray-200" orientation="horizontal" />
            <div className="flex items-center justify-end gap-3 px-3 py-1">
              <PopoverClose asChild>
                <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
                  <span className="">Cancel</span>
                </button>
              </PopoverClose>
              <PopoverClose asChild>
                <button
                  className="bg-brand hover:bg-brand-500 flex justify-start gap-2 rounded-lg px-3 py-2 transition-colors"
                  onClick={handleAddColumn}
                >
                  <span className="">Create Field</span>
                </button>
              </PopoverClose>
            </div>
          </PopoverContent>
          <TooltipPortal>
            <TooltipContent side="bottom">
              <p>Add Property</p>
            </TooltipContent>
          </TooltipPortal>
        </Tooltip>
      </TooltipProvider>
    </Popover>
  );
}
