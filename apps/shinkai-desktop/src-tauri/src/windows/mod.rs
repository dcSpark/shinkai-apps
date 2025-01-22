use tauri::{utils::config::BackgroundThrottlingPolicy, AppHandle, Error, Manager, WebviewWindow, WebviewWindowBuilder};

#[derive(Debug, Clone, Copy)]
pub enum Window {
    Main,
    ShinkaiNodeManager,
    Spotlight,
    Coordinator,
}

impl Window {
    pub fn as_str(&self) -> &'static str {
        match self {
            Window::Main => "main",
            Window::ShinkaiNodeManager => "shinkai-node-manager",
            Window::Spotlight => "spotlight",
            Window::Coordinator => "coordinator",
        }
    }
}

pub fn get_window(app_handle: AppHandle, window_name: Window, focus: bool) -> tauri::Result<WebviewWindow> {
    let label = window_name.as_str();
    if let Some(window) = app_handle.get_webview_window(label) {
        log::info!("window {} found, bringing to front", label);
        if focus {
            log::info!("focusing window {}", label);
            if window.is_minimized().unwrap_or_default() {
                let _ = window.unminimize();
            }
            window.show().unwrap();
            // window.center().unwrap();
            let _ = window.set_focus();
        }
        return Ok(window);
    }
    log::info!("window {} not found", label);
    Err(Error::WindowNotFound)
}

pub fn recreate_window(app_handle: AppHandle, window_name: Window, focus: bool) -> tauri::Result<WebviewWindow> {
    let label = window_name.as_str();
    if let Some(window) = app_handle.get_webview_window(label) {
        log::info!("window {} found, bringing to front", label);
        if focus {
            log::info!("focusing window {}", label);
            if window.is_minimized().unwrap_or_default() {
                let _ = window.unminimize();
            }
            window.show().unwrap();
            // window.center().unwrap();
            let _ = window.set_focus();
        }
        Ok(window)
    } else {
        log::info!("window {} not found, recreating...", label);
        let mut window_config = app_handle
            .config()
            .app
            .windows
            .iter()
            .find(|w| w.label == label)
            .unwrap()
            .clone();
        if window_config.label == Window::Coordinator.as_str() {
            window_config.background_throttling = Some(BackgroundThrottlingPolicy::Disabled);
        }
        match WebviewWindowBuilder::from_config(&app_handle, &window_config) {
            Ok(builder) => match builder.build() {
                Ok(window) => {
                    log::info!("window {} created", label);
                    Ok(window)
                }
                Err(e) => {
                    log::error!("failed to recreate window: {}", e);
                    Err(e)
                },
            },
            Err(e) => {
                log::error!("failed to recreate window from config: {}", e);
                Err(e)
            }
        }
    }
}

pub fn hide_spotlight_window(app_handle: AppHandle) {
    if let Some(window) = app_handle.get_webview_window(Window::Spotlight.as_str()) {
        window.hide().unwrap();
    }
}

pub fn show_spotlight_window(app_handle: AppHandle) {
    if let Some(window) = app_handle.get_webview_window(Window::Spotlight.as_str()) {
        window.show().unwrap();
    }
}
