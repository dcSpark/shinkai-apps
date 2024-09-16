use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder}, tray::TrayIconBuilder, LogicalSize, Manager, Runtime, Size
};

use crate::globals::SHINKAI_NODE_MANAGER_INSTANCE;

pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> tauri::Result<()> {
    let quit_menu_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
    let hide_show_menu_item = MenuItemBuilder::with_id("hide_show", "Hide").build(app)?;

    let open_shinkai_node_manager_window_menu_item =
        MenuItemBuilder::with_id("open_shinkai_node_manager_window", "Open").build(app)?;
    let shinkai_node_manager_menu_item = SubmenuBuilder::new(app, "Shinkai Node Manager")
        .item(&open_shinkai_node_manager_window_menu_item)
        .build()?;

    let menu = MenuBuilder::new(app)
        .items(&[
            &quit_menu_item,
            &hide_show_menu_item,
            &shinkai_node_manager_menu_item,
        ])
        .build()?;
    let is_template = cfg!(target_os = "macos");
    let icon =     if cfg!(target_os = "macos") {
        tauri::image::Image::from_bytes(include_bytes!("../icons/tray-icon-macos.png"))?
    } else {
        app.default_window_icon().unwrap().clone()
    };
    let _ = TrayIconBuilder::with_id("tray")
        .icon(icon)
        .icon_as_template(is_template)
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id().as_ref() {
            "hide_show" => {
                let window = app.get_webview_window("main").unwrap();
                if window.is_visible().unwrap() {
                    window.hide().unwrap();
                    let _ = hide_show_menu_item.set_text("Show");
                } else {
                    window.show().unwrap();
                    window.center().unwrap();
                    let _ = hide_show_menu_item.set_text("Hide");
                }
            }
            "open_shinkai_node_manager_window" => {
                let shinkai_node_manager_window = "shinkai-node-manager-window".to_string();
                let existing_window = app.get_webview_window(&shinkai_node_manager_window);
                if let Some(window) = existing_window {
                    let _ = window.set_focus();
                    return;
                }
                let new_window = tauri::WebviewWindowBuilder::new(
                    app,
                    shinkai_node_manager_window,
                    tauri::WebviewUrl::App("src/windows/shinkai-node-manager/index.html".into()),
                )
                .build()
                .unwrap();
                let _ = new_window.set_title("Shinkai Node Manager");
                let _ = new_window.set_resizable(true);
                let _ = new_window.set_size(Size::Logical(LogicalSize {
                    width: 1280.0,
                    height: 820.0,
                }));
            }
            "quit" => {
                tauri::async_runtime::spawn(async {
                    // For some reason process::exit doesn't fire RunEvent::ExitRequested event in tauri
                    let mut shinkai_node_manager_guard =
                        SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
                    if shinkai_node_manager_guard.is_running().await {
                        shinkai_node_manager_guard.kill().await;
                    }
                    std::process::exit(0);
                });
            }
            _ => (),
        })
        .build(app)?;
    Ok(())
}
