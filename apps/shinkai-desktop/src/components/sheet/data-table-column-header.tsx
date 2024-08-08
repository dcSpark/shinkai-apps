import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import {
  ColumnBehavior,
  ColumnType,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useRemoveColumnSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/removeColumnSheet/useRemoveColumnSheet';
import { useSetColumnSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/setColumnSheet/useSetColumnSheet';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowList/useGetWorkflowList';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import {
  FilesIcon,
  FormulaIcon,
  WorkflowPlaygroundIcon,
} from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Column } from '@tanstack/react-table';
import {
  BotIcon,
  ChevronRight,
  EyeOff,
  FileUpIcon,
  HashIcon,
  SparklesIcon,
  TextIcon,
  Trash,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useAuth } from '../../store/auth';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  columnBehavior?: ColumnBehavior;
}
export const fieldTypes = [
  {
    id: ColumnType.Text,
    label: 'Text',
    icon: TextIcon,
  },
  {
    id: ColumnType.Number,
    label: 'Number',
    icon: HashIcon,
  },
  {
    id: ColumnType.Formula,
    label: 'Formula',
    icon: FormulaIcon,
  },
  {
    id: ColumnType.LLMCall,
    label: 'AI Generated',
    icon: SparklesIcon,
  },
  {
    id: ColumnType.MultipleVRFiles,
    label: 'AI Local Files',
    icon: FilesIcon,
  },
  {
    id: ColumnType.UploadedFiles,
    label: 'Upload Files',
    icon: FileUpIcon,
  },
];

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  columnBehavior,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const auth = useAuth((state) => state.auth);
  const { sheetId } = useParams();

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
  const [columnName, setColumnName] = useState(title);
  const [selectedAgent, setSelectedAgent] = useState(llmProviders[0]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflowList?.[0]);

  const getColumnBehaviorName = (
    columnBehavior?: ColumnBehavior,
  ): ColumnType => {
    if (typeof columnBehavior === 'string') {
      return columnBehavior;
    }
    if (typeof columnBehavior === 'object') {
      return Object.keys(columnBehavior)[0] as ColumnType;
    }
    return ColumnType.Text;
  };

  const getFormula = (columnBehavior?: ColumnBehavior): string => {
    if (
      typeof columnBehavior === 'object' &&
      ColumnType.Formula in columnBehavior
    ) {
      return Object.values(columnBehavior)[0] as string;
    }
    return '';
  };
  const [formula, setFormula] = useState('');
  const [promptInput, setPromptInput] = useState('');

  console.log(getFormula(columnBehavior), '======', formula);

  useEffect(() => {
    setFormula(getFormula(columnBehavior));
  }, [columnBehavior]);

  const currentType =
    fieldTypes.find(
      (type) => type.id === getColumnBehaviorName(columnBehavior),
    ) ?? fieldTypes[0];

  const [selectedType, setSelectedType] = useState(currentType);

  const { mutateAsync: setColumnSheet } = useSetColumnSheet();
  const { mutateAsync: removeSheetColumn } = useRemoveColumnSheet();

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

  const handleUpdateColumn = async () => {
    if (!auth || !sheetId) return;

    await setColumnSheet({
      profile: auth.profile,
      nodeAddress: auth.node_address,
      sheetId: sheetId,
      columnBehavior: generateColumnBehavior(currentType.id),
      columnName: columnName.replace(/\//g, '_'),
      columnId: column.id,
      shinkaiIdentity: auth.shinkai_identity,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  return (
    <div className={cn('w-full')}>
      <Popover
        onOpenChange={(open) => {
          if (!open) {
            void handleUpdateColumn();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            className="-ml-1.5 line-clamp-1 flex size-full justify-start gap-1.5 rounded-md bg-transparent px-2 pr-0 hover:bg-gray-300 data-[state=open]:bg-gray-300"
            size="sm"
            variant="ghost"
          >
            <currentType.icon className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">{title}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex flex-col bg-gray-300 px-0 py-2 text-xs"
        >
          <div className="px-3 py-1 text-left text-xs font-medium">
            <Input
              autoFocus
              className="!h-10 border-none bg-gray-200 py-0 text-xs caret-white placeholder:text-gray-100 focus-visible:ring-0 focus-visible:ring-white"
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

                    {selectedType?.label}
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
                    <option.icon className="h-3.5 w-3.5 text-gray-50" />
                    {option.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
          {selectedType.id === ColumnType.Formula && (
            <div className="px-3 py-1 text-left text-xs font-medium">
              <Input
                autoFocus
                className="placeholder-gray-80 !h-[40px] resize-none border-none bg-gray-200 py-0 pl-2 pt-0 text-xs caret-white focus-visible:ring-0 focus-visible:ring-white"
                onChange={(e) => {
                  setFormula(e.target.value);
                }}
                placeholder={'Formula'}
                spellCheck={false}
                value={formula}
              />
            </div>
          )}
          {(selectedType.id === ColumnType.LLMCall ||
            selectedType.id === ColumnType.MultipleVRFiles) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
                  <span className="text-gray-80">AI</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-gray-50">
                      <BotIcon className="h-3.5 w-3.5" />
                      {selectedAgent?.id}
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
          {(selectedType.id === ColumnType.LLMCall ||
            selectedType.id === ColumnType.MultipleVRFiles) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex justify-between gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-500">
                  <span className="text-gray-80">Workflow</span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1.5 text-gray-50">
                      <WorkflowPlaygroundIcon className="h-3.5 w-3.5" />
                      {selectedWorkflow?.name}
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
                spellCheck={false}
                value={promptInput}
              />
            </div>
          )}
          <Separator className="my-1 bg-gray-200" orientation="horizontal" />
          <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
            <EyeOff className="h-3.5 w-3.5" />
            <span className="">Hide Property</span>
          </button>
          <button
            className="flex justify-start gap-2 rounded-lg px-3 py-2 text-red-400 transition-colors hover:bg-gray-500"
            onClick={() => {
              if (!auth || !sheetId) return;
              removeSheetColumn({
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
            <span className="">Delete Property</span>
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
