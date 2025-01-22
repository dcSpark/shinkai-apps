use tauri::{Emitter, Listener, WindowEvent};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::windows::{get_window, recreate_window, Window};

#[derive(Debug, Clone, serde::Serialize)]
pub struct OAuthDeepLinkPayload {
    pub state: String,
    pub code: String,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct StoreDeepLinkPayload {
    pub tool_type: String,
    pub tool_url: String,
}

pub fn setup_deep_links(app: &tauri::AppHandle) -> tauri::Result<()> {
    #[cfg(any(windows, target_os = "linux"))]
    {
        use tauri_plugin_deep_link::DeepLinkExt;
        app.deep_link()
            .register_all()
            .map_err(|e| tauri::Error::Anyhow(e.into()))?;
    }
    let app_handle = app.clone();
    app.deep_link().on_open_url(move |event| {
        let urls: Vec<_> = event.urls().into_iter().collect();
        log::debug!("deep link URLs: {:?}", urls);
        for url in urls {
            log::debug!("handling deep link: {:?}", url);
            if let Some(host) = url.host() {
                if host.to_string() == "store" {
                    // shinkai://store?type=tool&url=https://download.shinkai.app/tool/email-fetcher.zip
                    let query_pairs = url.query_pairs().collect::<Vec<_>>();
                    let tool_type = query_pairs
                        .iter()
                        .find(|(key, _)| key == "type")
                        .map(|(_, value)| value.to_string())
                        .unwrap_or_default();
                    let tool_url = query_pairs
                        .iter()
                        .find(|(key, _)| key == "url")
                        .map(|(_, value)| value.to_string())
                        .unwrap_or_default();

                    let payload = StoreDeepLinkPayload {
                        tool_type,
                        tool_url,
                    };
                    let app_handle_clone = app_handle.clone();

                    match get_window(app_handle_clone.clone(), Window::Main, true) {
                        Ok(_) => {
                            log::info!("Successfully got main window");
                            let _ = app_handle_clone.emit_to(
                                Window::Main.as_str(),
                                "store-deep-link",
                                payload,
                            );
                        }
                        Err(e) => {
                            log::error!("Failed to get main window: {}", e);
                            // Spawn window recreation in a separate task
                            tauri::async_runtime::spawn(async move {
                                match recreate_window(app_handle_clone.clone(), Window::Main, true) {
                                    Ok(window) => {
                                        window.once("shinkai-app-ready", move |_| {
                                            log::info!("shinkai-app-ready event received, emitting store-deep-link");
                                            let _ = app_handle_clone.emit_to(
                                                Window::Main.as_str(),
                                                "store-deep-link",
                                                payload,
                                            );
                                        });
                                    }
                                    Err(e) => {
                                        log::error!("Failed to recreate main window: {}", e);
                                    }
                                }
                            });
                        }
                    }
                }

                if host.to_string() == "oauth" {
                    log::debug!("oauth deep link: {:?}", url);
                    let query_pairs = url.query_pairs().collect::<Vec<_>>();
                    let state = query_pairs
                        .iter()
                        .find(|(key, _)| key == "state")
                        .map(|(_, value)| value.to_string())
                        .unwrap_or_default();
                    let code = query_pairs
                        .iter()
                        .find(|(key, _)| key == "code")
                        .map(|(_, value)| value.to_string())
                        .unwrap_or_default();
                    let payload = OAuthDeepLinkPayload { state, code };
                    log::debug!(
                        "emitting oauth-deep-link event to {}",
                        Window::Coordinator.as_str()
                    );
                    let _ = recreate_window(app_handle.clone(), Window::Main, true);
                    let _ = app_handle.emit_to(
                        Window::Coordinator.as_str(),
                        "oauth-deep-link",
                        payload,
                    );
                }
            }
        }
    });
    Ok(())
}
