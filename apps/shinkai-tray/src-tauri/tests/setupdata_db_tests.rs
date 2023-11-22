use std::{fs, path::Path};

use shinkai_tray::models::setup_data::SetupData;

fn setup() {
    let path = Path::new("db_tests/");
    let _ = fs::remove_dir_all(&path);
}

#[cfg(test)]
mod tests {
    use super::*;
    use rocksdb::DB;
    use shinkai_tray::{db::db::TrayDB, models::setup_data::SetupData};

    #[test]
    fn test_write_and_read_setup_data() {
        setup();
        // Create a new TrayDB instance for testing
        let db = TrayDB::new("db_tests/test_db").unwrap();

        // Generate a test SetupData instance
        let setup_data = SetupData::new(
            "test_registration_code".to_string(),
            "test_profile".to_string(),
            "test_registration_name".to_string(),
            "test_identity_type".to_string(),
            "test_permission_type".to_string(),
            "test_node_address".to_string(),
            "test_shinkai_identity".to_string(),
            "test_node_encryption_pk".to_string(),
            "test_node_signature_pk".to_string(),
            "test_profile_encryption_sk".to_string(),
            "test_profile_encryption_pk".to_string(),
            "test_profile_identity_sk".to_string(),
            "test_profile_identity_pk".to_string(),
            "test_my_device_encryption_sk".to_string(),
            "test_my_device_encryption_pk".to_string(),
            "test_my_device_identity_sk".to_string(),
            "test_my_device_identity_pk".to_string(),
        );

        let setup_data_clone = setup_data.clone();

        // Write the test SetupData to the database
        let resp = db.write_setup_data(setup_data_clone).unwrap();
        eprintln!("resp: {:?}", resp);

        // Read the entire SetupData from the database and check that it matches the test SetupData
        let read_setup_data = db.read_setup_data().unwrap();
        assert_eq!(read_setup_data, setup_data);

        // Read each key from the database and check that the value matches the test SetupData
        assert_eq!(
            db.read_setup_data_key("registration_code").unwrap(),
            setup_data.registration_code
        );
        assert_eq!(db.read_setup_data_key("profile").unwrap(), setup_data.profile);

        // Try to read a key that doesn't exist and check that it returns an error
        assert!(db.read_setup_data_key("nonexistent_key").is_err());

         // Update a key in the SetupData and check that the new value is stored in the database
         let new_value = "new_value".to_string();
         db.update_setup_data_key("profile", &new_value).unwrap();
         assert_eq!(db.read_setup_data_key("profile").unwrap(), new_value);
    }
}
