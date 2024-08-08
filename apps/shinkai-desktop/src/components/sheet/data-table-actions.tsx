import { zodResolver } from '@hookform/resolvers/zod';
import { PopoverClose } from '@radix-ui/react-popover';
import {
  ColumnBehavior,
  ColumnType,
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
  Form,
  FormField,
  FormMessage,
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
import { Fragment, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useAuth } from '../../store/auth';
import { fieldTypes } from './constants';
import { SetColumnFormSchema, setColumnFormSchema } from './forms';

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
  const [popupOpen, setPopupOpen] = useState(false);

  const auth = useAuth((state) => state.auth);
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

  const setColumnForm = useForm<SetColumnFormSchema>({
    resolver: zodResolver(setColumnFormSchema),
    defaultValues: {
      columnName: '',
      columnType: ColumnType.Text,
      promptInput: '',
      agentId: llmProviders[0]?.id,
      workflow: undefined,
    },
  });

  const { mutateAsync: setColumnSheet } = useSetColumnSheet({
    onSuccess: () => {
      setPopupOpen(false);
      setColumnForm.reset();
    },
  });

  const currentColumnType = useWatch({
    control: setColumnForm.control,
    name: 'columnType',
  });

  const currentAgentId = useWatch({
    control: setColumnForm.control,
    name: 'agentId',
  });

  const currentWorkflow = useWatch({
    control: setColumnForm.control,
    name: 'workflow',
  });
  const currentFormula = useWatch({
    control: setColumnForm.control,
    name: 'formula',
  });
  const currentPromptInput = useWatch({
    control: setColumnForm.control,
    name: 'promptInput',
  });

  const generateColumnBehavior = (columnType: ColumnType): ColumnBehavior => {
    switch (columnType) {
      case ColumnType.Text:
        return ColumnType.Text;
      case ColumnType.Number:
        return ColumnType.Number;
      case ColumnType.Formula:
        return { [ColumnType.Formula]: currentFormula as string };
      case ColumnType.LLMCall:
        return {
          [ColumnType.LLMCall]: {
            input: currentPromptInput as string,
            workflow: currentWorkflow,
            llm_provider_name: currentAgentId ?? '',
          },
        };
      case ColumnType.MultipleVRFiles:
        return {
          [ColumnType.MultipleVRFiles]: {
            files: [
              [
                '/My Files (Private)/Shinkai/Shinkai Whitepaper',
                'Shinkai Whitepaper',
              ],
            ],
          },
        };
      case ColumnType.UploadedFiles:
        return {
          [ColumnType.UploadedFiles]: {
            files: [
              '/My Files (Private)/Shinkai/Shinkai Whitepaper',
              '/My Files (Private)/Shinkai/Shinkai Whitepaper',
            ],
          },
        };
      default:
        return ColumnType.Text;
    }
  };

  const selectedType = fieldTypes.find((type) => type.id === currentColumnType);

  const onSubmit = async (values: SetColumnFormSchema) => {
    if (!auth || !sheetId || !selectedType) return;
    await setColumnSheet({
      profile: auth.profile,
      nodeAddress: auth.node_address,
      sheetId: sheetId,
      columnBehavior: generateColumnBehavior(selectedType.id),
      columnName: values.columnName,
      columnId: undefined,
      shinkaiIdentity: auth.shinkai_identity,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  return (
    <Popover onOpenChange={setPopupOpen} open={popupOpen}>
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
            <Form {...setColumnForm}>
              <form
                className="flex flex-1 shrink-0 flex-col gap-1"
                onSubmit={setColumnForm.handleSubmit(onSubmit)}
              >
                <div className="px-3 py-1 text-left text-xs font-medium">
                  <FormField
                    control={setColumnForm.control}
                    name="columnName"
                    render={({ field }) => (
                      <div className="space-y-1">
                        <Input
                          autoFocus
                          className="placeholder-gray-80 !h-[40px] resize-none border-none bg-gray-200 py-0 pl-2 pt-0 text-xs caret-white focus-visible:ring-0 focus-visible:ring-white"
                          onChange={field.onChange}
                          placeholder={'Column Name'}
                          value={field.value}
                        />
                        <FormMessage />
                      </div>
                    )}
                  />
                </div>
                <Separator
                  className="my-1 bg-gray-200"
                  orientation="horizontal"
                />
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
                    className="w-[200px] rounded-md bg-gray-300 p-0 px-2 py-2.5 text-gray-50"
                    side="right"
                  >
                    {fieldTypes.map((option) => {
                      return (
                        <DropdownMenuCheckboxItem
                          checked={selectedType?.id === option.id}
                          className="line-clamp-1 flex gap-2 rounded-lg p-2 pl-8 text-xs capitalize hover:bg-gray-500 [&>span:first-child]:bg-transparent"
                          key={option.id}
                          onCheckedChange={() => {
                            setColumnForm.setValue('columnType', option.id);
                          }}
                        >
                          <option.icon className="h-3.5 w-3.5 shrink-0 text-gray-50" />
                          <span>{option.label}</span>
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
                {selectedType?.id === ColumnType.LLMCall && (
                  <FormField
                    control={setColumnForm.control}
                    name="agentId"
                    render={({ field }) => (
                      <Fragment>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
                              <span className="text-gray-80">AI</span>
                              <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1.5 text-gray-50">
                                  <BotIcon className="h-3.5 w-3.5" />
                                  {field.value ?? 'Select'}
                                </span>
                                <ChevronRight className="text-gray-80 h-3.5 w-3.5" />
                              </div>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="w-[200px] rounded-md bg-gray-300 p-0 px-2 py-2.5 text-gray-50"
                            side="right"
                          >
                            {llmProviders.map((option) => {
                              return (
                                <DropdownMenuCheckboxItem
                                  checked={option.id === currentAgentId}
                                  className="line-clamp-1 flex gap-2 rounded-lg p-2 pl-8 text-xs capitalize hover:bg-gray-500 [&>span:first-child]:bg-transparent"
                                  key={option.id}
                                  onCheckedChange={() =>
                                    field.onChange(option.id)
                                  }
                                >
                                  {option.id}
                                </DropdownMenuCheckboxItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <FormMessage className="px-2 text-left" />
                      </Fragment>
                    )}
                  />
                )}
                {selectedType?.id === ColumnType.Formula && (
                  <div className="px-3 py-1 text-left text-xs font-medium">
                    <FormField
                      control={setColumnForm.control}
                      name="formula"
                      render={({ field }) => (
                        <div className="space-y-1">
                          <Input
                            className="placeholder-gray-80 !h-[40px] resize-none border-none bg-gray-200 py-0 pl-2 pt-0 text-xs caret-white focus-visible:ring-0 focus-visible:ring-white"
                            onChange={field.onChange}
                            placeholder={'Formula'}
                            spellCheck={false}
                            value={field.value}
                          />
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>
                )}
                {selectedType?.id === ColumnType.LLMCall && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
                        <span className="text-gray-80">Workflow</span>
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1.5 text-gray-50">
                            <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                            {currentWorkflow?.name || 'None'}
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
                      <DropdownMenuCheckboxItem
                        checked={undefined === currentWorkflow?.name}
                        className="flex gap-2 truncate text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                        onCheckedChange={() =>
                          setColumnForm.setValue('workflow', undefined)
                        }
                      >
                        None
                      </DropdownMenuCheckboxItem>

                      {workflowList?.map((option) => {
                        return (
                          <DropdownMenuCheckboxItem
                            checked={option.name === currentWorkflow?.name}
                            className="flex gap-2 truncate text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                            key={option.name}
                            onCheckedChange={() =>
                              setColumnForm.setValue('workflow', option)
                            }
                          >
                            {option.name}
                          </DropdownMenuCheckboxItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {selectedType?.id === ColumnType.LLMCall && (
                  <div className="flex justify-between gap-2 px-2 py-2">
                    <FormField
                      control={setColumnForm.control}
                      name="promptInput"
                      render={({ field }) => (
                        <div className="w-full space-y-1">
                          <Textarea
                            className="placeholder-gray-80 !min-h-[100px] resize-none bg-gray-200 pl-2 pt-2 text-xs"
                            onChange={field.onChange}
                            placeholder={'Enter prompt or a formula...'}
                            spellCheck={false}
                            value={field.value}
                          />
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>
                )}
                <Separator
                  className="my-1 bg-gray-200"
                  orientation="horizontal"
                />
                <div className="flex items-center justify-end gap-3 px-3 py-1">
                  <PopoverClose asChild>
                    <button
                      className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500"
                      type="button"
                    >
                      <span className="">Cancel</span>
                    </button>
                  </PopoverClose>
                  <button
                    className="bg-brand hover:bg-brand-500 flex justify-start gap-2 rounded-lg px-3 py-2 transition-colors"
                    type="submit"
                  >
                    <span className="">Create Field</span>
                  </button>
                </div>
              </form>
            </Form>
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
