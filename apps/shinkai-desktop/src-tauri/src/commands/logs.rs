use serde::Serialize;
use tauri::Manager;

#[derive(Debug, Clone, Serialize)]
pub struct LogEntry {
    timestamp: String,
    level: String,
    target: String,
    message: String,
}

#[tauri::command]
pub fn retrieve_logs(app_handle: tauri::AppHandle) -> Result<Vec<LogEntry>, String> {
    let log_dir = app_handle.path().app_log_dir().map_err(|e| e.to_string())?;
    let product_name = app_handle
        .config()
        .product_name
        .clone()
        .unwrap_or("Shinkai Desktop".to_string());
    let log_file = format!("{}/{}.log", log_dir.display(), product_name);

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
            if let Some(timestamp_end) = line.find(']') {
                let timestamp = line[1..timestamp_end].to_string();

                if let Some(level_end) = line[timestamp_end + 1..].find(']') {
                    let level = line[timestamp_end + 2..timestamp_end + 1 + level_end].to_string();

                    if let Some(target_end) = line[timestamp_end + level_end + 2..].find(']') {
                        let target = line[timestamp_end + level_end + 3
                            ..timestamp_end + level_end + 2 + target_end]
                            .to_string();
                        let message = line[timestamp_end + level_end + target_end + 4..]
                            .trim()
                            .to_string();

                        return Some(LogEntry {
                            timestamp,
                            level,
                            target,
                            message,
                        });
                    }
                }
            }
            None
        })
        .collect();

    Ok(log_entries)
}
