import type { SetupPayload } from '@shinkai_network/shinkai-message-ts/models';

export type CreateRegistrationCodeInput = {
  nodeAddress: string;
  permissionsType: string;
  identityType?: string;
  setupPayload: SetupPayload;
  profileName?: string;
};
export type CreateRegistrationCodeOutput = string;
