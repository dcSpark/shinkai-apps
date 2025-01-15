use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager,
};

use crate::{
    globals::SHINKAI_NODE_MANAGER_INSTANCE,
    windows::{recreate_window, Window},
};

pub fn create_tray(app: &tauri::AppHandle) -> tauri::Result<()> {
    let quit_menu_item = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
    let show_menu_item = MenuItemBuilder::with_id("show", "Show").build(app)?;

    let open_shinkai_node_manager_window_menu_item =
        MenuItemBuilder::with_id("open_shinkai_node_manager_window", "Open").build(app)?;
    let shinkai_node_manager_menu_item = SubmenuBuilder::new(app, "Shinkai Node Manager")
        .item(&open_shinkai_node_manager_window_menu_item)
        .build()?;

    let menu = MenuBuilder::new(app)
        .items(&[
            &quit_menu_item,
            &show_menu_item,
            &shinkai_node_manager_menu_item,
        ])
        .build()?;
    let is_template = cfg!(target_os = "macos");
    let icon = if cfg!(target_os = "macos") {
        tauri::image::Image::from_bytes(include_bytes!("../icons/tray-icon-macos.png"))?
    } else {
        app.default_window_icon().unwrap().clone()
    };
    let _ = TrayIconBuilder::with_id("tray")
        .icon(icon)
        .icon_as_template(is_template)
        .on_tray_icon_event(|tray, event| {
            if cfg!(target_os = "windows") {
                if let TrayIconEvent::Click { button, .. } = event {
                    if button == MouseButton::Left {
                        recreate_window(tray.app_handle().clone(), Window::Main, true);
                    }
                }
            }
        })
        .menu_on_left_click(!cfg!(target_os = "windows"))
        .menu(&menu)
        .on_menu_event(move |tray, event| match event.id().as_ref() {
            "show" => {
                recreate_window(tray.app_handle().clone(), Window::Main, true);
            }
            "open_shinkai_node_manager_window" => {
                recreate_window(tray.app_handle().clone(), Window::ShinkaiNodeManager, true);
            }
            "quit" => {
                tauri::async_runtime::spawn(async move {
                    // For some reason process::exit doesn't fire RunEvent::ExitRequested event in tauri
                    let mut shinkai_node_manager_guard =
                        SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
                    if shinkai_node_manager_guard.is_running().await {
                        shinkai_node_manager_guard.kill().await;
                    }
                    drop(shinkai_node_manager_guard);
                    std::process::exit(0);
                });
            }
            _ => (),
        })
        .build(app)?;
    Ok(())
}
