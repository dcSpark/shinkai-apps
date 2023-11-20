use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub struct SetupData {
    pub registration_code: String,
    pub profile: String,
    pub registration_name: String,
    pub identity_type: String,
    pub permission_type: String,
    pub node_address: String,
    pub shinkai_identity: String,
    pub node_encryption_pk: String,
    pub node_signature_pk: String,
    pub profile_encryption_sk: String,
    pub profile_encryption_pk: String,
    pub profile_identity_sk: String,
    pub profile_identity_pk: String,
    pub my_device_encryption_sk: String,
    pub my_device_encryption_pk: String,
    pub my_device_identity_sk: String,
    pub my_device_identity_pk: String,
}

impl SetupData {
    pub fn new(
        registration_code: String,
        profile: String,
        registration_name: String,
        identity_type: String,
        permission_type: String,
        node_address: String,
        shinkai_identity: String,
        node_encryption_pk: String,
        node_signature_pk: String,
        profile_encryption_sk: String,
        profile_encryption_pk: String,
        profile_identity_sk: String,
        profile_identity_pk: String,
        my_device_encryption_sk: String,
        my_device_encryption_pk: String,
        my_device_identity_sk: String,
        my_device_identity_pk: String,
    ) -> Self {
        Self {
            registration_code,
            profile,
            registration_name,
            identity_type,
            permission_type,
            node_address,
            shinkai_identity,
            node_encryption_pk,
            node_signature_pk,
            profile_encryption_sk,
            profile_encryption_pk,
            profile_identity_sk,
            profile_identity_pk,
            my_device_encryption_sk,
            my_device_encryption_pk,
            my_device_identity_sk,
            my_device_identity_pk,
        }
    }
}