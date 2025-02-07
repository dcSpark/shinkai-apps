use tauri::Manager;

#[tauri::command]
pub async fn retrieve_logs(app_handle: tauri::AppHandle) -> Result<String, String> {
    let log_dir = app_handle.path().app_log_dir().map_err(|e| e.to_string())?;
    let log_file = format!("{}/shinkai-desktop.log", log_dir.display());

    let log_contents = match std::fs::read_to_string(log_file) {
        Ok(contents) => contents,
        Err(e) => {
            log::error!("Failed to read log file: {}", e);
            return Err("Failed to read log file".to_string());
        }
    };
    Ok(log_contents)
}
