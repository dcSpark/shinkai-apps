import { submitRegistrationCode } from '@shinkai_network/shinkai-message-ts/api';
import { SetupPayload } from '@shinkai_network/shinkai-message-ts/models';

export const submitRegistration = async (setupData: SetupPayload) => {
  const response = await submitRegistrationCode(setupData);
  return response;
};
