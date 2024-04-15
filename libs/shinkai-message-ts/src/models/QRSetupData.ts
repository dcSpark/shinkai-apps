export type Base58String = string;

export interface QRSetupData {
  registration_code: string;
  profile: string;
  identity_type: string;
  permission_type: string;
  node_address: string;
  shinkai_identity: string;
  node_encryption_pk: Base58String;
  node_signature_pk: Base58String;
  // Just filled when identity_type === device
  profile_encryption_sk?: Base58String;
  profile_encryption_pk?: Base58String;
  profile_identity_sk?: Base58String;
  profile_identity_pk?: Base58String;
}
