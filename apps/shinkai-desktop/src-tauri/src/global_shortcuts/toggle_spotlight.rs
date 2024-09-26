use tauri::Manager;
use tauri_plugin_global_shortcut::{Shortcut, ShortcutEvent};

pub fn toggle_spotlight(app: &tauri::AppHandle, _: Shortcut, _: ShortcutEvent) {
    if let Some(window) = app.get_webview_window("spotlight") {
        if let (Ok(visible), Ok(focused)) = (window.is_visible(), window.is_focused()) {
            if visible && focused {
                let _ = window.hide();
            } else {
                let _ = window.show();
                let _ = window.set_focus();
            }
        } else {
            log::error!("failed to get spotlight window visibility");
        }
    }
}
