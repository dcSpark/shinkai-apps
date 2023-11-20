use std::sync::Arc;

use reqwest::Error;
use serde::Deserialize;
use tauri::async_runtime::Mutex;

use crate::{db::db::TrayDB, models::setup_data::SetupData};

#[tauri::command]
pub fn process_onboarding_data(data: SetupData, db: tauri::State<'_, TrayDB>) -> Result<String, String> {
    println!("data: {:?}", data);

    // Write the data to the database
    db.write_setup_data(data).map_err(|e| e.to_string())?;

    Ok("Data received successfully".to_string())
}

#[tauri::command]
pub fn validate_setup_data(db: tauri::State<'_, TrayDB>) -> Result<bool, String> {
    let setup_data = db.read_setup_data().map_err(|e| e.to_string())?;

    Ok(!setup_data.node_encryption_pk.is_empty() &&
       !setup_data.node_address.is_empty() &&
       !setup_data.my_device_encryption_sk.is_empty() &&
       !setup_data.my_device_identity_sk.is_empty() &&
       !setup_data.registration_name.is_empty())
}
