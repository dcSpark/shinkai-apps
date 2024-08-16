import {
  ColumnBehavior,
  ColumnStatus,
  JobCredentialsPayload,
} from '@shinkai_network/shinkai-message-ts/models';

export type GetSheetInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  sheetId: string;
};
export type Column = {
  behavior?: ColumnBehavior;
  id: string;
  name: string;
};
export type Row = {
  last_updated: string;
  status: ColumnStatus;
  value: string;
};

export type FormattedRow = {
  rowId: string;
  fields: {
    [columnId: string]: Row & {
      columnId: string;
      rowId: string;
    };
  };
};
export type Columns = {
  [key: string]: Column;
};
export type Rows = {
  [rowId: string]: {
    [columnId: string]: Row;
  };
};

export type Sheet = {
  // column_dependency_manager: {
  //   dependencies: {};
  //   reverse_dependencies: {};
  // };
  columns: Columns;
  rows: Rows;
  sheet_name: string;
  uuid: string;
  display_rows: string[];
  display_columns: string[];
};

export type GetSheetOutput = Sheet;
