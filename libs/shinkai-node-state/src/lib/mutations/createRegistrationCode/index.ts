import { submitRequestRegistrationCode } from '@shinkai_network/shinkai-message-ts/api';

import { CreateRegistrationCodeInput } from './types';

export const createRegistrationCode = async ({
  nodeAddress,
  permissionsType,
  identityType,
  setupPayload,
  profileName,
}: CreateRegistrationCodeInput) => {
  let finalCodeType = identityType;
  if (identityType === 'device') {
    // Serialize permissionsType as "device:PROFILE_NAME" when "Device" is selected
    finalCodeType = `device:${profileName}`;
  }

  const code = await submitRequestRegistrationCode(
    nodeAddress,
    permissionsType,
    finalCodeType,
    setupPayload,
  );
  return code;
};
