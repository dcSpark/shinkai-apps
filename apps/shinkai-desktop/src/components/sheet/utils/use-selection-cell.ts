import type { Column, Row } from '@tanstack/react-table';
import * as React from 'react';

export interface CellCoordinates {
  rowId: string;
  columnId: string;
}

export interface Selection {
  start: CellCoordinates;
  end: CellCoordinates;
}
// TODO: multiple cell selection

export function useCellSelection<TData>(
  rows: Row<TData>[],
  columns: Column<TData>[],
) {
  const [selectedCell, setSelectedCell] =
    React.useState<CellCoordinates | null>(null);

  const [selection, setSelection] = React.useState<Selection | null>(null);
  const [isSelecting, setIsSelecting] = React.useState(false);

  const cellRefs = React.useRef<{
    [key: string]: React.RefObject<HTMLTableCellElement>;
  }>({});

  const columnIndexMap = React.useMemo(() => {
    return columns.reduce((acc: { [key: string]: number }, column, index) => {
      acc[column.id] = index;
      return acc;
    }, {});
  }, [columns]);

  const rowIndexMap = React.useMemo(() => {
    return rows.reduce((acc: { [key: string]: number }, row, index) => {
      acc[row.id] = index;
      return acc;
    }, {});
  }, [rows]);

  const getCellRef = (rowId: string, columnId: string) => {
    const key = `${rowId}-${columnId}`;
    if (!cellRefs.current[key]) {
      cellRefs.current[key] = React.createRef();
    }
    return cellRefs.current[key];
  };

  const isCellSelected = React.useCallback(
    (cellRowId: string, cellColumnId: string) => {
      return (
        selectedCell &&
        selectedCell.rowId === cellRowId &&
        selectedCell.columnId === cellColumnId
      );
    },
    [selectedCell],
  );

  const isCellInRange = React.useCallback(
    (cellRowId: string, cellColumnId: string) => {
      if (!selection) return false;

      const rowIndex = rowIndexMap[cellRowId];
      const columnIndex = columnIndexMap[cellColumnId];

      const startRowIndex = rowIndexMap[selection.start.rowId];
      const startColumnIndex = columnIndexMap[selection.start.columnId];
      const endRowIndex = rowIndexMap[selection.end.rowId];
      const endColumnIndex = columnIndexMap[selection.end.columnId];

      const isRowInRange =
        rowIndex >= Math.min(startRowIndex, endRowIndex) &&
        rowIndex <= Math.max(startRowIndex, endRowIndex);
      const isColumnInRange =
        columnIndex >= Math.min(startColumnIndex, endColumnIndex) &&
        columnIndex <= Math.max(startColumnIndex, endColumnIndex);

      return isRowInRange && isColumnInRange;
    },
    [selection, columnIndexMap, rowIndexMap],
  );

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    rowId: string,
    columnId: string,
  ) => {
    const { key } = e;

    if (
      ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)
    ) {
      e.preventDefault();

      const edgeRowId = selection ? selection.end.rowId : rowId;
      const edgeColumnId = selection ? selection.end.columnId : columnId;

      const rowIndex = rows.findIndex((r) => r.id === edgeRowId);
      const columnIndex = columns.findIndex((c) => c.id === edgeColumnId);

      let nextRowId = edgeRowId;
      let nextColumnId = edgeColumnId;

      switch (key) {
        case 'ArrowUp':
          if (rowIndex > 0) {
            nextRowId = rows[rowIndex - 1].id;
          }
          break;
        case 'ArrowDown':
          if (rowIndex < rows.length - 1) {
            nextRowId = rows[rowIndex + 1].id;
          }
          break;
        case 'ArrowLeft':
          if (columnIndex > 0) {
            nextColumnId = columns[columnIndex - 1].id;
          }
          break;
        case 'ArrowRight':
          if (columnIndex < columns.length - 1) {
            nextColumnId = columns[columnIndex + 1].id;
          }
          break;
        case 'Tab':
          if (e.shiftKey) {
            if (columnIndex > 0) {
              nextColumnId = columns[columnIndex - 1].id;
            }
          } else {
            if (columnIndex < columns.length - 1) {
              nextColumnId = columns[columnIndex + 1].id;
            }
          }
          break;
        default:
          return;
      }

      const nextSelectedCell = { rowId: nextRowId, columnId: nextColumnId };

      if (e.shiftKey && selectedCell) {
        setSelection((prev) => {
          const start = prev?.start || selectedCell;
          return { start, end: nextSelectedCell };
        });
      } else {
        if (!e.shiftKey) {
          setSelectedCell(nextSelectedCell);
          setSelection({
            start: nextSelectedCell,
            end: nextSelectedCell,
          });
        }
      }
    }
  };

  const handleMouseDown = React.useCallback(
    (rowId: string, columnId: string) => {
      setSelectedCell({ rowId, columnId });
      setSelection({
        start: { rowId, columnId },
        end: { rowId, columnId },
      });
      setIsSelecting(true);
    },
    [],
  );

  const handleMouseEnter = React.useCallback(
    (rowId: string, columnId: string) => {
      if (isSelecting) {
        setSelection((prev) => {
          if (!prev) return null;
          return {
            start: prev.start,
            end: { rowId, columnId },
          };
        });
      }
    },
    [isSelecting],
  );

  const handleMouseUp = React.useCallback(() => {
    setIsSelecting(false);
  }, []);

  const handleClick = React.useCallback((rowId: string, columnId: string) => {
    setSelectedCell({
      rowId,
      columnId,
    });
  }, []);

  React.useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseUp]);

  React.useLayoutEffect(() => {
    if (selectedCell) {
      const { rowId, columnId } = selectedCell;
      const key = `${rowId}-${columnId}`;
      const cellRef = cellRefs.current[key];
      if (cellRef && cellRef.current) {
        cellRef.current.focus();
      }
    }
  }, [selectedCell]);

  return {
    selectedCell,
    selection,
    getCellRef,
    isCellSelected,
    isCellInRange,
    handleClick,
    handleKeyDown,
    handleMouseDown,
    handleMouseEnter,
  };
}
