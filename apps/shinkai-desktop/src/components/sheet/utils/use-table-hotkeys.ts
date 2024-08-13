import { FormattedRow } from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';
import type { Column, Row } from '@tanstack/react-table';
import { useHotkeys } from 'react-hotkeys-hook';

import { useSheetProjectStore } from '../context/table-context';

interface Props {
  rows: Row<FormattedRow>[];
  leafColumns: Column<FormattedRow, unknown>[];
}

const HOTKEYS = [
  // Navigation
  'ArrowUp',
  'ArrowLeft',
  'ArrowRight',
  'ArrowDown',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  // Editing
  'Enter',
  'Escape',
  'Tab',
].join(',');

const useTableHotkeys = ({ rows, leafColumns }: Props) => {
  const { selectedCell, setSelectedCell } = useSheetProjectStore(
    ({ selectedCell, setSelectedCell }) => ({
      selectedCell,
      setSelectedCell,
    }),
  );

  useHotkeys(
    HOTKEYS,
    (ev) => {
      if (!selectedCell) return;
      console.log(selectedCell, 'selectedCell');
      if (['Escape', 'Tab'].includes(ev.key) && selectedCell.isFocused) {
        setSelectedCell({ ...selectedCell, isFocused: false });
      } else if (ev.key === 'Enter' && !selectedCell.isFocused) {
        setSelectedCell({ ...selectedCell, isFocused: true });
      }

      let rowId = selectedCell.rowId;
      let colId = selectedCell.columnId;

      const rowIdx = rows.findIndex((r) => r.id === rowId);
      const colIdx = leafColumns.findIndex((c) => c.id === colId);

      if (rowIdx === -1 || colIdx === -1) {
        console.warn('Could not find row/col for cell', selectedCell);
        return;
      }

      switch (ev.key) {
        case 'ArrowUp': {
          if (ev.ctrlKey || ev.metaKey) rowId = rows[0].id;
          else rowId = rowIdx > 0 ? rows[rowIdx - 1].id : rows[rowIdx].id;
          break;
        }
        case 'ArrowDown': {
          if (ev.ctrlKey || ev.metaKey) rowId = rows[rows.length - 1].id;
          else
            rowId =
              rowIdx < rows.length - 1 ? rows[rowIdx + 1].id : rows[rowIdx].id;
          break;
        }
        case 'ArrowLeft': {
          if (ev.ctrlKey || ev.metaKey) colId = leafColumns[0].id;
          else {
            const idx = colIdx > 1 ? colIdx - 1 : colIdx;
            colId = leafColumns[idx].id;
          }
          break;
        }
        case 'ArrowRight': {
          if (ev.ctrlKey || ev.metaKey)
            colId = leafColumns[leafColumns.length - 1].id;
          else {
            const idx = colIdx < leafColumns.length - 1 ? colIdx + 1 : colIdx;
            colId = leafColumns[idx].id;
          }
          break;
        }
        case 'PageUp':
        case 'Home': {
          colId = leafColumns[0].id;
          if (ev.ctrlKey || ev.metaKey) rowId = rows[0].id;
          break;
        }
        case 'PageDown':
        case 'End': {
          colId = leafColumns[leafColumns.length - 1].id;
          if (ev.ctrlKey || ev.metaKey) rowId = rows[rows.length - 1].id;
          break;
        }
      }

      setSelectedCell({ columnId: colId, rowId: rowId, isFocused: false });
    },
    { enableOnFormTags: true, preventDefault: true },
    [rows, leafColumns, selectedCell, setSelectedCell],
  );
};

export default useTableHotkeys;
