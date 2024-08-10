import { PopoverClose } from '@radix-ui/react-popover';
import { Tooltip } from '@radix-ui/react-tooltip';
import { useTranslation } from '@shinkai_network/shinkai-i18n';
import {
  ColumnBehavior,
  ColumnStatus,
  ColumnType,
} from '@shinkai_network/shinkai-message-ts/models/SchemaTypes';
import { useSetCellSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/setCellSheet/useSetCellSheet';
import { useGetVRPathSimplified } from '@shinkai_network/shinkai-node-state/lib/queries/getVRPathSimplified/useGetVRPathSimplified';
import { transformDataToTreeNodes } from '@shinkai_network/shinkai-node-state/lib/utils/files';
import {
  Badge,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from '@shinkai_network/shinkai-ui';
import { cn } from '@shinkai_network/shinkai-ui/utils';
import { ColumnDef, Row } from '@tanstack/react-table';
import { AnimatePresence, motion } from 'framer-motion';
import { FileInput, PlusIcon } from 'lucide-react';
import { Tree } from 'primereact/tree';
import { TreeNode } from 'primereact/treenode';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { treeOptions } from '../../lib/constants';
import { useAuth } from '../../store/auth';
import { getColumnBehaviorName } from './utils';

interface DataTableCellProps<TData> {
  row: Row<TData>;
  column: ColumnDef<TData>;
  title: string;
  value: string;
  status: ColumnStatus;
  columnBehavior: ColumnBehavior | undefined;
}

export function DataTableCell<TData>({
  row,
  value,
  column,
  status,
  columnBehavior,
}: DataTableCellProps<TData>) {
  const { sheetId } = useParams();
  const { mutateAsync: setCellSheet } = useSetCellSheet();
  const auth = useAuth((state) => state.auth);
  const [open, setOpen] = React.useState(false);

  const [cellValue, setCellValue] = React.useState(value);

  const [isVectorFSOpen, setIsVectorFSOpen] = React.useState(false);

  const handleUpdateCell = async () => {
    if (!auth || !sheetId) return;
    await setCellSheet({
      nodeAddress: auth.node_address,
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      sheetId: sheetId ?? '',
      columnId: column.id ?? '',
      rowId: row.id ?? '',
      value: cellValue,
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  useEffect(() => {
    if (!open) {
      setCellValue(value);
    }
  }, [open, value]);

  const isCellValueChanged = cellValue !== value;
  const columnType = getColumnBehaviorName(columnBehavior);
  const isMultipleVRFiles = columnType === ColumnType.MultipleVRFiles;
  return (
    <div className={cn('w-full', isMultipleVRFiles && 'pt-3')}>
      {isMultipleVRFiles ? (
        <button
          className={cn(
            'flex items-center justify-center rounded-xl bg-gray-50/10 px-2 py-1 transition-colors hover:bg-gray-200',
            value && 'border border-gray-300 bg-transparent',
          )}
          onClick={() => {
            setIsVectorFSOpen(true);
          }}
        >
          {value ? (
            <span className="flex items-center justify-start gap-1">
              <FileInput className="text-gray-80 h-3.5 w-3.5" />
              <span className="line-clamp-1 flex-1 text-left">
                {value.split('/')?.at(-1)}
              </span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <PlusIcon size={16} />
              Add Local AI Files
            </span>
          )}
        </button>
      ) : (
        <Popover onOpenChange={setOpen} open={open}>
          <PopoverTrigger asChild>
            <div
              className="relative -ml-1.5 flex h-12 w-full items-center justify-start gap-1.5 rounded-lg bg-transparent px-2 py-1 pr-0"
              role="button"
              tabIndex={0}
            >
              <span
                className={cn(
                  'line-clamp-2 flex-1 text-left text-gray-50',
                  status === ColumnStatus.Pending && 'text-gray-80',
                )}
              >
                {status === ColumnStatus.Pending ? 'Generating ...' : value}
              </span>
              {status && status === ColumnStatus.Pending && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="absolute right-0 flex items-center justify-center p-0">
                        <span
                          className={cn(
                            'shadow-[0px_0px_1px_1px_#0000001a]',
                            'animate-shadow-pulse h-1.5 w-1.5 rounded-full',
                            'bg-orange-400',
                          )}
                        />
                      </Badge>
                    </TooltipTrigger>
                    <TooltipPortal>
                      <TooltipContent>
                        <p>{status}</p>
                      </TooltipContent>
                    </TooltipPortal>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="flex flex-col bg-gray-300 p-0 text-xs"
            side="bottom"
            sideOffset={-45}
          >
            <Textarea
              autoFocus
              className="placeholder-gray-80 border-brand focus-visible:ring-brand !min-h-[80px] resize-none bg-gray-500 pl-2 pt-2 text-xs"
              onChange={(e) => setCellValue(e.target.value)}
              onKeyDown={async (e) => {
                if (e.metaKey && e.key === 'Enter') {
                  await handleUpdateCell();
                  setOpen(false);
                }
              }}
              placeholder="Enter prompt"
              value={cellValue}
            />
            <AnimatePresence mode="popLayout">
              {isCellValueChanged && (
                <motion.div
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-end gap-3 px-3 py-1"
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                >
                  <PopoverClose asChild>
                    <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
                      <span className="">Cancel</span>
                    </button>
                  </PopoverClose>
                  <PopoverClose asChild>
                    <button
                      className="bg-brand hover:bg-brand-500 flex justify-start gap-2 rounded-lg px-3 py-2 transition-colors"
                      onClick={handleUpdateCell}
                    >
                      <span className="">Save</span>
                    </button>
                  </PopoverClose>
                </motion.div>
              )}
            </AnimatePresence>
          </PopoverContent>
        </Popover>
      )}
      <VectorFsScopeDrawer
        isVectorFSOpen={isVectorFSOpen}
        onSubmit={async () => {
          await handleUpdateCell();
          setIsVectorFSOpen(false);
        }}
        onVectorFSOpenChanges={setIsVectorFSOpen}
        selectedFileKey={cellValue}
        setSelectedFileKey={setCellValue}
      />
    </div>
  );
}

export const VectorFsScopeDrawer = ({
  isVectorFSOpen,
  onVectorFSOpenChanges,
  selectedFileKey,
  setSelectedFileKey,
  onSubmit,
}: {
  isVectorFSOpen: boolean;
  onVectorFSOpenChanges: (value: boolean) => void;
  selectedFileKey: string;
  setSelectedFileKey: (value: string) => void;
  onSubmit: () => void;
}) => {
  const [nodes, setNodes] = useState<TreeNode[]>([]);
  const auth = useAuth((state) => state.auth);

  const { data: VRFiles, isSuccess: isVRFilesSuccess } = useGetVRPathSimplified(
    {
      nodeAddress: auth?.node_address ?? '',
      profile: auth?.profile ?? '',
      shinkaiIdentity: auth?.shinkai_identity ?? '',
      path: '/',
      my_device_encryption_sk: auth?.profile_encryption_sk ?? '',
      my_device_identity_sk: auth?.profile_identity_sk ?? '',
      node_encryption_pk: auth?.node_encryption_pk ?? '',
      profile_encryption_sk: auth?.profile_encryption_sk ?? '',
      profile_identity_sk: auth?.profile_identity_sk ?? '',
    },
  );

  useEffect(() => {
    if (isVRFilesSuccess) {
      setNodes(transformDataToTreeNodes(VRFiles));
    }
  }, [VRFiles, isVRFilesSuccess]);

  const { t } = useTranslation();
  return (
    <Sheet onOpenChange={onVectorFSOpenChanges} open={isVectorFSOpen}>
      <SheetContent className={'flex flex-col'}>
        <SheetHeader className="mb-3">
          <SheetTitle className="flex h-[40px] items-center gap-4">
            Add Local AI File
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-max-[60vh] flex-1">
          <Tree
            onSelectionChange={(e) => setSelectedFileKey(e.value as string)}
            pt={treeOptions}
            selectionKeys={selectedFileKey}
            selectionMode="single"
            value={nodes}
          />
        </ScrollArea>

        <SheetFooter>
          <Button type="button" variant="outline">
            {t('common.cancel')}
          </Button>
          <Button onClick={onSubmit} type="button">
            {t('common.done')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
