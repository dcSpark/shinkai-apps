use crate::windows::{hide_spotlight_window, show_spotlight_window, open_main_window_with_path};

#[tauri::command]
pub async fn hide_spotlight_window_app(app_handle: tauri::AppHandle) {
    hide_spotlight_window(app_handle)
}

#[tauri::command]
pub async fn show_spotlight_window_app(app_handle: tauri::AppHandle) {
    show_spotlight_window(app_handle)
}

#[tauri::command]
pub async fn open_main_window_with_path_app(app_handle: tauri::AppHandle, path: String) {
    open_main_window_with_path(app_handle, path)
}
