// TODO: Refactor these naive auth structures
export interface SetupPayload {
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
}

export interface CredentialsPayload {
    my_device_encryption_sk: string;
    my_device_identity_sk: string;
    node_encryption_pk: string;
}

export type JobCredentialsPayload = CredentialsPayload & {
    profile_encryption_sk: string;
    profile_identity_sk: string;
}

export type AgentCredentialsPayload = CredentialsPayload & {
    profile_encryption_sk: string;
    profile_identity_sk: string;
}

export type LastMessagesFromInboxCredentialsPayload = {
    shinkai_identity: string;
    profile: string;
    profile_encryption_sk: string;
    profile_identity_sk: string;
    node_encryption_pk: string;
}

export interface APIUseRegistrationCodeSuccessResponse {
  message: string;
  encryption_public_key: string;
  identity_public_key: string;
}
