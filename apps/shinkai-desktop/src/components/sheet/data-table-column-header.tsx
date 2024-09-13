import { zodResolver } from '@hookform/resolvers/zod';
import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { PopoverClose } from '@radix-ui/react-popover';
import {
  ColumnBehavior,
  ColumnType,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useRemoveColumnSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/removeColumnSheet/useRemoveColumnSheet';
import { useSetColumnSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/setColumnSheet/useSetColumnSheet';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/v2/queries/getLLMProviders/useGetLLMProviders';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/v2/queries/getWorkflowList/useGetWorkflowList';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  Form,
  FormField,
  FormMessage,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { WorkflowPlaygroundIcon } from '@shinkai_network/shinkai-ui/assets';
import { formatText } from '@shinkai_network/shinkai-ui/helpers';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Column } from '@tanstack/react-table';
import {
  BotIcon,
  ChevronDownIcon,
  ChevronRight,
  EyeOff,
  Trash,
} from 'lucide-react';
import { SortAltIcon } from 'primereact/icons/sortalt';
import { Fragment, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../store/auth';
import { fieldTypes } from './constants';
import { SetColumnFormSchema, setColumnFormSchema } from './forms';
import {
  getAgentId,
  getColumnBehaviorName,
  getFormula,
  getPromptInput,
  getWorkflowKey,
} from './utils';

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  columnBehavior?: ColumnBehavior;
  columnLetter: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  columnLetter,
  columnBehavior,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const auth = useAuth((state) => state.auth);
  const { sheetId } = useParams();
  const [open, setOpen] = useState(false);

  const { llmProviders } = useGetLLMProviders({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });
  const { data: workflowList } = useGetWorkflowList({
    nodeAddress: auth?.node_address ?? '',
    token: auth?.api_v2_key ?? '',
  });

  const setColumnForm = useForm<SetColumnFormSchema>({
    resolver: zodResolver(setColumnFormSchema),
    defaultValues: {
      columnName: title,
      columnType: getColumnBehaviorName(columnBehavior),
      promptInput: getPromptInput(columnBehavior),
      agentId: getAgentId(columnBehavior),
      workflowKey: getWorkflowKey(columnBehavior) ?? undefined,
      formula: getFormula(columnBehavior),
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

  const currentWorkflowKey = useWatch({
    control: setColumnForm.control,
    name: 'workflowKey',
  });
  const currentFormula = useWatch({
    control: setColumnForm.control,
    name: 'formula',
  });
  const currentPromptInput = useWatch({
    control: setColumnForm.control,
    name: 'promptInput',
  });

  const selectedType = fieldTypes.find((type) => type.id === currentColumnType);

  const currentType =
    fieldTypes.find(
      (type) => type.id === getColumnBehaviorName(columnBehavior),
    ) ?? fieldTypes[0];

  const selectedWorkflow = workflowList?.find(
    (workflow) => workflow.tool_router_key === currentWorkflowKey,
  );

  const { mutateAsync: setColumnSheet } = useSetColumnSheet({
    onSuccess: () => {
      setOpen(false);
    },
  });
  const { mutateAsync: removeSheetColumn } = useRemoveColumnSheet();

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
            workflow_name: currentWorkflowKey,
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

  const onSubmit = async (values: SetColumnFormSchema) => {
    if (!auth || !sheetId || !selectedType) return;
    await setColumnSheet({
      profile: auth.profile,
      nodeAddress: auth.node_address,
      sheetId: sheetId,
      columnBehavior: generateColumnBehavior(selectedType.id),
      columnName: values.columnName,
      columnId: column.id as string,
      shinkaiIdentity: auth.shinkai_identity,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  return (
    <div className={cn('flex w-full items-center')}>
      <Popover
        onOpenChange={(open) => {
          if (!open) {
            setColumnForm.reset();
          }
          setOpen(open);
        }}
        open={open}
      >
        <PopoverTrigger asChild>
          <Button
            className="-ml-1.5 line-clamp-1 flex size-full justify-start gap-1.5 rounded-md bg-transparent px-2 pr-0 hover:bg-gray-300 data-[state=open]:bg-gray-300"
            size="sm"
            type="button"
            variant="ghost"
          >
            <currentType.icon className="h-3.5 w-3.5 shrink-0" /> (
            {columnLetter})
            <span className="line-clamp-1 flex-1 text-left">{title}</span>
          </Button>
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
                        onFocus={(e) => {
                          e.currentTarget.select();
                        }}
                        placeholder="Column Name"
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
                        className="flex gap-2 rounded-lg p-2 pl-8 text-xs capitalize hover:bg-gray-500 [&>span:first-child]:bg-transparent"
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
                                {field?.value ?? 'Select'}
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
                          {formatText(selectedWorkflow?.name ?? 'None')}
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
                      checked={undefined === currentWorkflowKey}
                      className="flex gap-2 truncate text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                      onCheckedChange={() =>
                        setColumnForm.setValue('workflowKey', undefined)
                      }
                    >
                      None
                    </DropdownMenuCheckboxItem>

                    {workflowList?.map((option) => {
                      return (
                        <DropdownMenuCheckboxItem
                          checked={
                            option.tool_router_key === currentWorkflowKey
                          }
                          className="flex gap-2 truncate text-xs capitalize hover:bg-gray-500 [&>svg]:bg-transparent"
                          key={option.name}
                          onCheckedChange={() =>
                            setColumnForm.setValue(
                              'workflowKey',
                              option.tool_router_key,
                            )
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
                  <span className="">Save</span>
                </button>
              </div>
            </form>
          </Form>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="flex h-full justify-start gap-1.5 rounded-md bg-transparent px-1 hover:bg-gray-300 data-[state=open]:bg-gray-300"
            size="sm"
            type="button"
            variant="ghost"
          >
            <span className="sr-only">Column Settings</span>
            <ChevronDownIcon className="text-gray-80 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          alignOffset={-4}
          className="flex w-[200px] flex-col bg-gray-300 px-1 py-2 text-xs"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <button
            className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500"
            onClick={column.getToggleSortingHandler()}
          >
            <SortAltIcon className="h-3.5 w-3.5" />
            <span className="">Sort Column</span>
          </button>
          <Separator className="my-1 bg-gray-200" orientation="horizontal" />
          <button
            className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500"
            onClick={() => {
              column.toggleVisibility(!column.getIsVisible());
            }}
          >
            <EyeOff className="h-3.5 w-3.5" />
            <span className="">Hide Column</span>
          </button>
          <button
            className="flex justify-start gap-2 rounded-lg px-3 py-2 text-red-400 transition-colors hover:bg-gray-500"
            onClick={async () => {
              if (!auth || !sheetId) return;
              await removeSheetColumn({
                profile: auth.profile,
                nodeAddress: auth.node_address,
                sheetId: sheetId,
                columnId: column.id as string,
                shinkaiIdentity: auth.shinkai_identity,
                my_device_encryption_sk: auth.my_device_encryption_sk,
                my_device_identity_sk: auth.my_device_identity_sk,
                node_encryption_pk: auth.node_encryption_pk,
                profile_encryption_sk: auth.profile_encryption_sk,
                profile_identity_sk: auth.profile_identity_sk,
              });
            }}
          >
            <Trash className="h-3.5 w-3.5" />
            <span className="">Delete Column</span>
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
