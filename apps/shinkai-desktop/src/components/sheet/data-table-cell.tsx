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
  ScrollArea,
  Sheet,
  SheetClose,
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
import { useHotkeys } from 'react-hotkeys-hook';
import { useParams } from 'react-router-dom';

import { treeOptions } from '../../lib/constants';
import { useAuth } from '../../store/auth';
import { useSettings } from '../../store/settings';
import { useSheetProjectStore } from './context/table-context';
import { getColumnBehaviorName, getRowHeight } from './utils';

interface DataTableCellProps<TData> {
  row: Row<TData>;
  column: ColumnDef<TData>;
  title: string;
  value: string | null;
  status: ColumnStatus;
  columnBehavior: ColumnBehavior | undefined;
}

const HOTKEYS = [
  ...Array.from(
    'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~',
  ),
];

export function DataTableCell<TData>({
  row,
  value: initialValue,
  column,
  status,
  columnBehavior,
}: DataTableCellProps<TData>) {
  const { sheetId } = useParams();
  const { selectedCell, setSelectedCell } = useSheetProjectStore(
    ({ selectedCell, setSelectedCell }) => ({
      selectedCell,
      setSelectedCell,
    }),
  );

  const isSelected =
    selectedCell &&
    selectedCell.rowId === row.id &&
    selectedCell.columnId === column.id;

  const isFocused = isSelected && selectedCell?.isFocused;

  const setIsFocused = (isFocused: boolean) => {
    setSelectedCell({
      rowId: row.id,
      columnId: column.id ?? '',
      isFocused,
    });
  };

  const { mutateAsync: setCellSheet } = useSetCellSheet();
  const auth = useAuth((state) => state.auth);
  const heightRow = useSettings((state) => state.heightRow);

  const [cellValue, setCellValue] = React.useState(initialValue);

  const cancelEditing = () => {
    setCellValue(initialValue);
    setSelectedCell({
      rowId: row.id,
      columnId: column.id ?? '',
      isFocused: false,
    });
  };

  const [isVectorFSOpen, setIsVectorFSOpen] = React.useState(false);

  const handleUpdateCell = async (colId?: string, rowId?: string) => {
    if (!auth || !sheetId) return;
    await setCellSheet({
      nodeAddress: auth.node_address,
      shinkaiIdentity: auth.shinkai_identity,
      profile: auth.profile,
      sheetId: sheetId ?? '',
      columnId: colId ?? column.id ?? '',
      rowId: rowId ?? row.id ?? '',
      value: cellValue ?? '',
      my_device_encryption_sk: auth.my_device_encryption_sk,
      my_device_identity_sk: auth.my_device_identity_sk,
      node_encryption_pk: auth.node_encryption_pk,
      profile_encryption_sk: auth.profile_encryption_sk,
      profile_identity_sk: auth.profile_identity_sk,
    });
  };

  const isCellValueChanged = cellValue !== initialValue;
  const columnType = getColumnBehaviorName(columnBehavior);
  const isMultipleVRFiles = columnType === ColumnType.MultipleVRFiles;

  const ref = useHotkeys<HTMLDivElement>(
    HOTKEYS,
    (ev) => {
      if (!selectedCell) return;
      const rowId = selectedCell.rowId;
      const colId = selectedCell.columnId;

      if (
        /^[a-zA-Z0-9!@#$%^&*()_+\-=[\]{}|;:'",.<>?/`~]$/i.test(ev.key) &&
        !ev.ctrlKey &&
        !ev.metaKey &&
        !ev.altKey &&
        !ev.shiftKey
      ) {
        setSelectedCell({ columnId: colId, rowId: rowId, isFocused: true });
        return;
      }
      if (ev.key === 'Backspace' && !selectedCell.isFocused) {
        ev.preventDefault();
        ev.stopPropagation();
        setCellValue('');
        handleUpdateCell(selectedCell.columnId, selectedCell.rowId);
        return;
      }
    },
    { enableOnFormTags: ['INPUT', 'TEXTAREA'] },
    [
      selectedCell,
      setCellValue,
      cellValue,
      setSelectedCell,
      handleUpdateCell,
      column.id,
      row.id,
    ],
  );

  const onChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const newValue = e.target.value;
    setCellValue(newValue);
  };

  const handleEndEditing = async () => {
    await handleUpdateCell();
    setIsFocused(false);
  };

  const handleBlur = () => handleEndEditing();

  useEffect(() => {
    setCellValue(initialValue);
  }, [initialValue]);

  const handleKeyDownOnEdit = (e: React.KeyboardEvent) => {
    if (e.metaKey && e.key === 'Enter') {
      handleEndEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    } else if (e.key === 'Tab') {
      handleEndEditing();
    }
    e.stopPropagation();
  };

  return (
    <div
      className={cn(
        'relative flex size-full items-center justify-start gap-1.5 rounded-lg bg-transparent px-2 py-1 pr-0 outline-none',
        isSelected &&
          'outline-brand rounded-sm outline outline-1 -outline-offset-1',
      )}
      onClick={(e) => {
        if (
          selectedCell?.rowId === row.id &&
          selectedCell?.columnId === column.id
        )
          return;
        setSelectedCell({
          rowId: row.id,
          columnId: column.id ?? '',
          isFocused: false,
        });
        e.currentTarget.focus();
      }}
      onDoubleClick={(e) => {
        if (isMultipleVRFiles) {
          setIsVectorFSOpen(true);
          return;
        }
        setSelectedCell({
          rowId: row.id,
          columnId: column.id ?? '',
          isFocused: true,
        });
        e.currentTarget.focus();
      }}
      ref={ref}
      role="button"
      tabIndex={isSelected ? 0 : -1}
    >
      {isFocused ? (
        <div
          className={cn(
            'absolute left-0 top-0 z-40 flex w-[110%] flex-col bg-gray-300 p-0 text-xs',
          )}
          style={{
            height: getRowHeight(heightRow) + 100,
          }}
        >
          <Textarea
            autoFocus
            className="placeholder-gray-80 border-brand focus-visible:ring-brand !min-h-[60px] flex-1 resize-none rounded-sm bg-gray-500 pl-2 pt-2 text-xs"
            onBlur={handleBlur}
            onChange={onChange}
            onFocus={(e) => {
              e.currentTarget?.focus();
              e.currentTarget?.setSelectionRange(
                e.target.value?.length,
                e.target.value?.length,
              );
            }}
            onKeyDown={handleKeyDownOnEdit}
            placeholder="Enter prompt"
            spellCheck={false}
            style={{
              font: 'inherit',
              letterSpacing: 'inherit',
            }}
            value={cellValue ?? undefined}
          />
          <AnimatePresence mode="popLayout">
            {isCellValueChanged && (
              <motion.div
                animate={{ opacity: 1 }}
                className="flex items-center justify-end gap-3 px-3 py-1"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0 }}
              >
                <button className="flex justify-start gap-2 rounded-lg px-3 py-2 text-white transition-colors hover:bg-gray-500">
                  <span className="">Cancel</span>
                </button>
                <button
                  className="bg-brand hover:bg-brand-500 flex justify-start gap-2 rounded-lg px-3 py-2 transition-colors"
                  onClick={() => handleUpdateCell(column.id, row.id)}
                >
                  <span className="">Save</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <>
          {isMultipleVRFiles ? (
            <div
              className={cn(
                'group ml-2 flex items-center justify-center rounded-xl bg-gray-50/10 px-2 py-[3px] transition-colors hover:bg-gray-200',
                initialValue && 'border border-gray-300 bg-transparent',
              )}
              onClick={() => setIsVectorFSOpen(true)}
            >
              {initialValue ? (
                <span className="flex items-center justify-start gap-1">
                  <FileInput className="text-gray-80 h-3.5 w-3.5" />
                  <span className={cn('flex-1 text-left')}>
                    {initialValue.split('/')?.at(-1)}
                  </span>
                </span>
              ) : (
                <span className="text-gray-80 flex items-center gap-2 text-xs transition-colors group-hover:text-white">
                  <PlusIcon size={16} />
                  Add Local AI Files
                </span>
              )}
            </div>
          ) : (
            <>
              <span
                className={cn(
                  'flex-1 text-left text-gray-50',
                  status === ColumnStatus.Pending && 'text-gray-80',
                  heightRow === 'small' && 'line-clamp-1',
                  heightRow === 'medium' && 'line-clamp-2',
                  heightRow === 'large' && 'line-clamp-5',
                  heightRow === 'extra-large' && 'line-clamp-[9]',
                )}
              >
                {status === ColumnStatus.Pending
                  ? 'Generating ...'
                  : initialValue}
              </span>
              {status && status === ColumnStatus.Pending && (
                <TooltipProvider delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge className="absolute right-2 top-3 flex items-center justify-center p-0">
                        <span
                          className={cn(
                            'shadow-[0px_0px_1px_1px_#0000001a]',
                            'animate-shadow-pulse h-1 w-1 rounded-full',
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
            </>
          )}
        </>
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
  selectedFileKey: string | null;
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
          <SheetClose asChild>
            <Button type="button" variant="outline">
              {t('common.cancel')}
            </Button>
          </SheetClose>
          <Button onClick={onSubmit} type="button">
            {t('common.done')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
