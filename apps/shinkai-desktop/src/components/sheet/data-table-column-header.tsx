import { DropdownMenuTrigger } from '@radix-ui/react-dropdown-menu';
import { useGetLLMProviders } from '@shinkai_network/shinkai-node-state/lib/queries/getLLMProviders/useGetLLMProviders';
import { useGetWorkflowList } from '@shinkai_network/shinkai-node-state/lib/queries/getWorkflowList/useGetWorkflowList';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Separator,
  Textarea,
} from '@shinkai_network/shinkai-ui';
import { WorkflowPlaygroundIcon } from '@shinkai_network/shinkai-ui/assets';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { Column } from '@tanstack/react-table';
import {
  BotIcon,
  CheckCircle2Icon,
  ChevronRight,
  EyeOff,
  FileUpIcon,
  Link2Icon,
  TextIcon,
  Trash,
} from 'lucide-react';
import React, { useState } from 'react';

import { useAuth } from '../../store/auth';

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}
const fieldTypes = [
  {
    id: 'text',
    label: 'Text',
    icon: TextIcon,
  },
  {
    id: 'file',
    label: 'File',
    icon: FileUpIcon,
  },
  {
    id: 'single-select',
    label: 'Single Select',
    icon: CheckCircle2Icon,
  },
  {
    id: 'url',
    label: 'URL',
    icon: Link2Icon,
  },
];

export function DataTableColumnHeader<TData, TValue>({
  // column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
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

  const [selectedAgent, setSelectedAgent] = useState(llmProviders[0]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflowList?.[0]);

  return (
    <div className={cn('w-full', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="-ml-1.5 line-clamp-1 flex size-full justify-start gap-1.5 rounded-md bg-transparent px-2 pr-0 hover:bg-gray-300 data-[state=open]:bg-gray-300"
            size="sm"
            variant="ghost"
          >
            <TextIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1 text-left">{title}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="flex flex-col bg-gray-300 px-0 py-2 text-xs"
        >
          <p className="px-3 py-1 text-left text-xs font-medium">{title}</p>
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
              className="w-[160px] rounded-md bg-gray-300 p-0 px-2 py-2.5 text-gray-50"
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
                    {option.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
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

          <div className="flex justify-between gap-2 px-2 py-2">
            <Textarea
              autoFocus
              className="placeholder-gray-80 !min-h-[100px] resize-none bg-gray-200 pl-2 pt-2 text-xs"
              placeholder="Enter prompt"
            />
          </div>
          <Separator className="my-1 bg-gray-200" orientation="horizontal" />
          <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
            <EyeOff className="h-3.5 w-3.5" />
            <span className="">Hide Property</span>
          </button>
          <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-red-400 transition-colors hover:bg-gray-500">
            <Trash className="h-3.5 w-3.5" />
            <span className="">Delete Property</span>
          </button>
        </PopoverContent>
      </Popover>
    </div>
  );
}
