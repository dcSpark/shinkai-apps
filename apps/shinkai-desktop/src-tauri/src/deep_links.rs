use tauri::{Emitter, EventTarget};
use tauri_plugin_deep_link::DeepLinkExt;

use crate::windows::{recreate_window, Window};

#[derive(Debug, Clone, serde::Serialize)]
pub struct OAuthDeepLinkPayload {
    pub state: String,
    pub code: String,
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
                if host.to_string() == "oauth" {
                    log::debug!("oauth deep link: {:?}", url);
                    let payload = OAuthDeepLinkPayload {
                        state: url.query().unwrap_or_default().to_string(),
                        code: url.query().unwrap_or_default().to_string(),
                    };
                    log::debug!("emitting oauth-deep-link event to {}", Window::Coordinator.as_str());
                    let _ = recreate_window(app_handle.clone(), Window::Main, true);
                    let _ = app_handle.emit_to(
                        EventTarget::webview_window(Window::Coordinator.as_str()),
                        "oauth-deep-link",
                        payload,
                    );
                }
            }
        }
    });
    Ok(())
}
