// TODO: Refactor these naive auth structures

export interface CredentialsPayload {
  my_device_encryption_sk: string;
  my_device_identity_sk: string;
  profile_encryption_sk: string;
  profile_identity_sk: string;
  node_encryption_pk: string;
}

export type JobCredentialsPayload = CredentialsPayload;
