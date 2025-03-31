use std::path::{self, PathBuf};

use serde::Serialize;
use tauri::Manager;

#[derive(Debug, Clone, Serialize)]
pub struct LogEntry {
    timestamp: String,
    level: String,
    target: String,
    message: String,
}

fn get_log_file_path(app_handle: &tauri::AppHandle) -> Result<PathBuf, String> {
    let log_dir = app_handle.path().app_log_dir().map_err(|e| e.to_string())?;
    let product_name = app_handle
        .config()
        .product_name
        .clone()
        .unwrap_or("Shinkai Desktop".to_string());
    let log_file = format!("{}/{}.log", log_dir.display(), product_name);
    Ok(PathBuf::from(log_file))
}

#[tauri::command]
pub fn retrieve_logs(app_handle: tauri::AppHandle) -> Result<Vec<LogEntry>, String> {
    let log_file = get_log_file_path(&app_handle)?;

    let log_contents = match std::fs::read_to_string(log_file) {
        Ok(contents) => contents,
        Err(e) => {
            log::error!("Failed to read log file: {}", e);
            return Err("Failed to read log file".to_string());
        }
    };

    // Split log contents into lines and parse each line into a LogEntry
    let log_entries: Vec<LogEntry> = log_contents
        .split("　　　")
        .filter(|line| !line.is_empty())
        .filter_map(|line| {
            // Expected format: [timestamp][level][target] message
            let re = regex::Regex::new(r"\[(.*?)\]\[(.*?)\]\[(.*?)\] ((?s).*)").unwrap();
            if let Some(captures) = re.captures(line) {
                let timestamp = captures.get(1).unwrap().as_str().to_string();
                let level = captures.get(2).unwrap().as_str().to_string();
                let target = captures.get(3).unwrap().as_str().to_string();
                let message = captures.get(4).unwrap().as_str().trim().to_string();

                return Some(LogEntry {
                    timestamp,
                    level,
                    target,
                    message,
                });
            }
            None
        })
        .collect();

    Ok(log_entries)
}

#[tauri::command]
pub fn download_logs(app_handle: tauri::AppHandle, save_path: String) -> Result<String, String> {
    let log_file = get_log_file_path(&app_handle)?;
    match std::fs::copy(log_file.clone(), save_path.clone()) {
        Ok(_) => Ok(save_path),
        Err(e) => {
            let log_file_str = log_file.to_string_lossy();
            log::error!(
                "failed to copy log file from {} to {}: {}",
                log_file_str,
                save_path.clone(),
                e
            );
            return Err("failed to copy log file".to_string());
        }
    }
}
