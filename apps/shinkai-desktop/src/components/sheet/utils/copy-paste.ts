import { useSetCellSheet } from '@shinkai_network/shinkai-node-state/lib/mutations/setCellSheet/useSetCellSheet';
import { FormattedRow } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import { copyToClipboard } from '@shinkai_network/shinkai-ui/helpers';
import { type Column, Row } from '@tanstack/react-table';
import { useCallback } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useParams } from 'react-router-dom';
import { ExternalToast, toast } from 'sonner';

import { useAuth } from '../../../store/auth';
import { SelectedCell } from '../context/table-context';

// TODO: when we have different types for uploading files
// export const SUPPORTED_TYPES_COPY = new Set([ColumnType.Text]);
// export const SUPPORTED_TYPES_PASTE = new Set([ColumnType.Text]);

type Props = {
  rows: Row<FormattedRow>[];
  leafColumns: Column<FormattedRow, unknown>[];
  selectedCell: SelectedCell | null;
};

const defaultToastOptions: ExternalToast = {
  position: 'bottom-center',
};

export function useTableMenuActions({
  rows,
  leafColumns,
  selectedCell,
}: Props) {
  const auth = useAuth((state) => state.auth);
  const { sheetId } = useParams();

  const { mutateAsync: setCellSheet } = useSetCellSheet();

  const handleUpdateCell = useCallback(
    async (value: string) => {
      if (!auth || !sheetId) return;
      await setCellSheet({
        nodeAddress: auth.node_address,
        shinkaiIdentity: auth.shinkai_identity,
        profile: auth.profile,
        sheetId: sheetId ?? '',
        columnId: selectedCell?.columnId ?? '',
        rowId: selectedCell?.rowId ?? '',
        value,
        my_device_encryption_sk: auth.my_device_encryption_sk,
        my_device_identity_sk: auth.my_device_identity_sk,
        node_encryption_pk: auth.node_encryption_pk,
        profile_encryption_sk: auth.profile_encryption_sk,
        profile_identity_sk: auth.profile_identity_sk,
      });
    },
    [auth, sheetId, setCellSheet, selectedCell?.columnId, selectedCell?.rowId],
  );

  const cellValueSelected = rows.find((row) => row.id === selectedCell?.rowId)
    ?.original?.fields[selectedCell?.columnId as string].value;

  const selectedCol = leafColumns.find(
    (col) => col.id === selectedCell?.columnId,
  );

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(cellValueSelected ?? '');
      toast.success('Cell Copied', defaultToastOptions);
    } catch (error) {
      toast.error(`Failed to copy:${error}`, defaultToastOptions);
    }
  }, [cellValueSelected]);

  const handlePaste = useCallback(async () => {
    try {
      if (!selectedCell || !selectedCol) return;
      let text: string;
      try {
        text = await navigator.clipboard.readText();
      } catch (e) {
        toast.error(`Read clipboard permission denied.`, defaultToastOptions);
        return;
      }

      handleUpdateCell(text);
    } catch (error) {
      toast.error(`field does not support the data type being pasted`);
    }
  }, [selectedCell, selectedCol, handleUpdateCell]);

  const tableRef = useHotkeys<HTMLTableElement>('mod+c,mod+v', (e) => {
    if (e.key === 'c') {
      void handleCopy();
    } else if (e.key === 'v') {
      void handlePaste();
    }
  });

  return tableRef;
}
