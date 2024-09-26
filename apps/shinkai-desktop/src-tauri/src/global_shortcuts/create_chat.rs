use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{Shortcut, ShortcutEvent};

pub fn create_chat(app: &tauri::AppHandle, _: Shortcut, _: ShortcutEvent) {
    if let Some(window) = app.get_webview_window("main") {
        if let Err(e) = app.emit("create-chat", ()) {
            log::error!("failed to emit 'create-chat': {}", e);
        }
        if let Err(e) = window.set_focus() {
            log::error!("failed to set focus: {}", e);
        }
    }
}
