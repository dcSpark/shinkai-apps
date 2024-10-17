import { Token } from '@shinkai_network/shinkai-message-ts/api/general/types';
import type {
  ColumnBehavior,
  CredentialsPayload,
} from '@shinkai_network/shinkai-message-ts/models';

export type SetSheetColumnOutput = {
  status: string;
  data: {
    sheet_id: string;
    status: string;
  };
};

export type SetSheetColumnInput = Token &
  CredentialsPayload & {
    nodeAddress: string;
    shinkaiIdentity: string;
    profile: string;
    sheetId: string;
    columnId: string | undefined;
    columnName: string;
    columnBehavior: ColumnBehavior;
  };
