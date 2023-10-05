import { submitInitialRegistrationNoCode } from "@shinkai_network/shinkai-message-ts/api";

export type SetupDataArgs = {
  my_device_encryption_sk: string;
  my_device_identity_sk: string;
  profile_encryption_sk: string;
  profile_identity_sk: string;
  node_encryption_pk: string;
  registration_code: string;
  identity_type: string;
  permission_type: string;
  registration_name: string;
  profile: string;
  shinkai_identity: string;
  node_address: string;
};
export const submitRegistration = async (setupData: SetupDataArgs) => {
  const response = await submitInitialRegistrationNoCode(setupData);
  return response;
};
