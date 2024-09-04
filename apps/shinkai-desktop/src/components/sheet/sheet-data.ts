import {
  FormattedRow,
  Rows,
} from '@shinkai_network/shinkai-node-state/lib/queries/getSheet/types';

export const generateRowsData = (rows: Rows, display_rows: string[]) => {
  return display_rows.map((rowId) => {
    const columns = rows[rowId];
    const formattedRow: FormattedRow = {
      rowId,
      fields: {},
    };

    Object.entries(columns).forEach(([columnId, columnData]) => {
      formattedRow.fields[columnId] = {
        ...columnData,
        columnId,
        rowId,
      };
    });

    return formattedRow;
  });
};
