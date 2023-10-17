import {
  submitInitialRegistrationNoCode,
  submitRegistrationCode,
} from '@shinkai_network/shinkai-message-ts/api';
import { SetupPayload } from '@shinkai_network/shinkai-message-ts/models';

export const submitRegistrationNoCode = async (setupData: SetupPayload) => {
  const response = await submitInitialRegistrationNoCode(setupData);
  return response;
};

export const submitRegistration = async (setupData: SetupPayload) => {
  const response = await submitRegistrationCode(setupData);
  return response;
};
