import type { JobCredentialsPayload } from '@shinkai_network/shinkai-message-ts/models';

export type GetUserSheetsInput = JobCredentialsPayload & {
  nodeAddress: string;
  shinkaiIdentity: string;
  profile: string;
};

export type Sheet = {
  // column_dependency_manager: {
  //   dependencies: {};
  //   reverse_dependencies: {};
  // };
  // columns: {};
  // rows: {};
  sheet_name: string;
  uuid: string;
};

export type GetUserSheetsOutput = Sheet[];
