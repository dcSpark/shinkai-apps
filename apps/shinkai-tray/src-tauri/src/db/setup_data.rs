use std::collections::HashMap;

use super::{
    db::{Topic, TrayDB},
    db_errors::TrayDBError,
};
use crate::models::setup_data::SetupData;

impl TrayDB {
    pub fn write_setup_data(&self, data: SetupData) -> Result<(), TrayDBError> {
        let cf = self.db.cf_handle(Topic::SetupData.as_str()).ok_or(TrayDBError::DataNotFound)?;

        let data_map: HashMap<String, String> = serde_json::from_value(serde_json::to_value(&data)?).map_err(TrayDBError::JsonSerializationError)?;

        for (key, value) in data_map {
            self.db.put_cf(cf, key.as_str(), value.as_str()).map_err(TrayDBError::RocksDBError)?;
        }

        Ok(())
    }

    pub fn read_setup_data(&self) -> Result<SetupData, TrayDBError> {
        let cf = self
            .db
            .cf_handle(Topic::SetupData.as_str())
            .ok_or(TrayDBError::DataNotFound)?;
    
        let mut data_map: HashMap<String, String> = HashMap::new();
    
        let keys = vec![
            "registration_code",
            "profile",
            "registration_name",
            "identity_type",
            "permission_type",
            "node_address",
            "shinkai_identity",
            "node_encryption_pk",
            "node_signature_pk",
            "profile_encryption_sk",
            "profile_encryption_pk",
            "profile_identity_sk",
            "profile_identity_pk",
            "my_device_encryption_sk",
            "my_device_encryption_pk",
            "my_device_identity_sk",
            "my_device_identity_pk",
        ];
    
        for key in keys {
            let value = self.db.get_cf(cf, key).map_err(TrayDBError::RocksDBError)?
                .ok_or(TrayDBError::DataNotFound)?;
            data_map.insert(key.to_string(), String::from_utf8(value).map_err(|_| TrayDBError::InvalidKey)?);
        }
    
        let setup_data: SetupData = serde_json::from_value(serde_json::to_value(data_map)?).map_err(TrayDBError::JsonSerializationError)?;
    
        Ok(setup_data)
    }

    pub fn read_setup_data_key(&self, key: &str) -> Result<String, TrayDBError> {
        let cf = self.db.cf_handle(Topic::SetupData.as_str()).ok_or(TrayDBError::DataNotFound)?;
        let value = self.db.get_cf(cf, key).map_err(TrayDBError::RocksDBError)?;

        match value {
            Some(data) => Ok(String::from_utf8(data).map_err(|_| TrayDBError::InvalidKey)?),
            None => Err(TrayDBError::DataNotFound),
        }
    }

    pub fn update_setup_data_key(&self, key: &str, new_value: &str) -> Result<(), TrayDBError> {
        let cf = self.db.cf_handle(Topic::SetupData.as_str()).ok_or(TrayDBError::DataNotFound)?;
        self.db.put_cf(cf, key, new_value).map_err(TrayDBError::RocksDBError)
    }
}
