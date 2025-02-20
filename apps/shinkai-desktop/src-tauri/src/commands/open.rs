use tauri_plugin_opener::Opener;

#[tauri::command]
pub fn open_location(path: String) -> Result<(), String> {
    println!("opening location: {}", path);
    opener::open(&path)
        .map_err(|e| format!("Failed to open location: {}", e))
}
