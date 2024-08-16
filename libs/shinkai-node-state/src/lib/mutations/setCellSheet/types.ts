import type { CredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type SetCellSheetOutput = {
  status: string;
  data: {
    sheet_id: string;
    status: string;
  };
};

export type SetCellSheetInput = CredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
  sheetId: string;
  columnId: string;
  rowId: string;
  value: string;
};
