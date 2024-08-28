export type CheckHealthResponse = {
  status: 'ok';
  node_name: string;
  is_pristine: boolean;
  version: string;
};

export type Token = { token: string };

export type SubmitRegistrationCodeRequest = {
  my_device_encryption_sk: string;
  my_device_identity_sk: string;
  profile_encryption_sk: string;
  profile_identity_sk: string;
  node_encryption_pk: string;
  registration_code: string;
  identity_type: string;
  permission_type: string;
  registration_name: string;
  profile: string; // sender_profile_name: it doesn't exist yet in the Node
  shinkai_identity: string;
  node_address: string;
};
export type SubmitRegistrationCodeResponse = {
  encryption_public_key: string;
  identity_public_key: string;
};

export type SubmitRegistrationNoCodeRequest = {
  node_address: string;
  my_device_encryption_sk: string;
  my_device_identity_sk: string;
  profile_encryption_sk: string;
  profile_identity_sk: string;
  registration_name: string;
  profile: string;
};
export type UseRegistrationNoCodeResponse = {
  message: string;
  encryption_public_key: string;
  identity_public_key: string;
  node_name: string;
  api_v2_key: string;
};
export type SubmitRegistrationNoCodeStatus =
  | 'success'
  | 'error'
  | 'non-pristine';

export type SubmitRegistrationNoCodeResponse = {
  status: SubmitRegistrationNoCodeStatus;
  data?: UseRegistrationNoCodeResponse;
};
