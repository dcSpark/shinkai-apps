import { submitRegistrationCode as submitRegistrationCodeApi } from '@shinkai_network/shinkai-message-ts/api/general/index';
import { submitRegistrationNoCode as submitRegistrationNoCodeApi } from '@shinkai_network/shinkai-message-ts/api/general/index';
import {
  SubmitRegistrationCodeRequest,
  SubmitRegistrationNoCodeRequest,
} from '@shinkai_network/shinkai-message-ts/api/general/types';

export const submitRegistration = async (
  setupData: SubmitRegistrationCodeRequest,
) => {
  const response = await submitRegistrationCodeApi(
    setupData.node_address,
    setupData,
  );
  return response;
};

export const submitRegistrationNoCode = async (
  setupData: SubmitRegistrationNoCodeRequest,
) => {
  const response = await submitRegistrationNoCodeApi(
    setupData.node_address,
    setupData,
  );
  return response;
};
