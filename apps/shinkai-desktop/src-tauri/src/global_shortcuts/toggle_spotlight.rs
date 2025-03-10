use tauri::Manager;
use tauri_plugin_global_shortcut::{Shortcut, ShortcutEvent};

use crate::windows::{recreate_window, Window};

pub fn toggle_spotlight(app: &tauri::AppHandle, _: Shortcut, _: ShortcutEvent) {
    log::info!("toggling spotlight window");
    if let Some(spotlight_window) = app.get_webview_window(Window::Spotlight.as_str()) {
        if spotlight_window.is_visible().unwrap_or(false) && spotlight_window.is_focused().unwrap_or(false) {
            let _ = spotlight_window.hide();
            return;
        }
    }
    recreate_window(app.clone(), Window::Spotlight, true);
}
