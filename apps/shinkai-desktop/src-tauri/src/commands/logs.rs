use std::env;

#[tauri::command]
pub async fn retrieve_logs() -> Result<String, String> {
    let log_dir = {
        #[cfg(target_os = "windows")]
        {
            let local_app_data = env::var("LOCALAPPDATA").map_err(|e| e.to_string())?;
            format!("{}/com.shinkai.desktop/logs", local_app_data)
        }

        #[cfg(target_os = "linux")]
        {
            let home = env::var("HOME").map_err(|e| e.to_string())?;
            format!("{}/.config/com.shinkai.desktop/logs", home)
        }

        #[cfg(target_os = "macos")]
        {
            let home = env::var("HOME").map_err(|e| e.to_string())?;
            format!("{}/Library/Logs/com.shinkai.desktop", home)
        }
    };

    let log_file = format!("{}/Shinkai Desktop.log", log_dir);

    let log_contents = match std::fs::read_to_string(log_file) {
        Ok(contents) => contents,
        Err(e) => {
            log::error!("Failed to read log file: {}", e);
            return Err("Failed to read log file".to_string());
        }
    };

    Ok(log_contents)
}
