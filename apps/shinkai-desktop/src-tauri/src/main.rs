// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;

use crate::commands::hardware::hardware_get_summary;
use crate::commands::shinkai_node_manager_commands::{
    shinkai_node_get_last_n_logs, shinkai_node_get_ollama_api_url, shinkai_node_get_options,
    shinkai_node_is_running, shinkai_node_kill, shinkai_node_remove_storage,
    shinkai_node_set_default_options, shinkai_node_set_options, shinkai_node_spawn, shinkai_node_get_default_model
};
use crate::commands::galxe::galxe_generate_desktop_installation_proof;
use crate::commands::galxe::galxe_generate_proof;

use globals::SHINKAI_NODE_MANAGER_INSTANCE;
use local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;
use tauri::GlobalShortcutManager;
use tauri::SystemTrayMenuItem;
use tauri::{CustomMenuItem, Manager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tokio::sync::Mutex;

mod audio;
mod commands;
mod globals;
mod local_shinkai_node;
mod hardware;
mod galxe;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide_show = CustomMenuItem::new("hide_show".to_string(), "Hide");
    let shinkai_node_manager_section_title = CustomMenuItem::new(
        "shinkai_node_manager_section_title".to_string(),
        "Shinkai Node Manager",
    )
    .disabled();
    let open_shinkai_node_manager_window =
        CustomMenuItem::new("open_shinkai_node_manager_window".to_string(), "Open");

    let tray_menu = SystemTrayMenu::new()
        .add_item(hide_show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(shinkai_node_manager_section_title)
        .add_item(open_shinkai_node_manager_window)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            shinkai_node_is_running,
            shinkai_node_get_last_n_logs,
            shinkai_node_get_options,
            shinkai_node_set_options,
            shinkai_node_spawn,
            shinkai_node_kill,
            shinkai_node_remove_storage,
            shinkai_node_set_default_options,
            shinkai_node_get_ollama_api_url,
            shinkai_node_get_default_model,
            hardware_get_summary,
            galxe_generate_desktop_installation_proof,
            galxe_generate_proof
        ])
        .setup(|app| {
            let app_clone = app.app_handle();

            let path = tauri::api::path::resolve_path(
                &app.config(),
                app.package_info(),
                &app.env(),
                "node_storage",
                Some(tauri::api::path::BaseDirectory::AppData),
            )?;
            {
                let _ = SHINKAI_NODE_MANAGER_INSTANCE.set(Arc::new(Mutex::new(
                    ShinkaiNodeManager::new(path.to_str().unwrap().to_string()),
                )));
            }
            let app_handle = app.app_handle();
            tauri::async_runtime::spawn(async move {
                let mut shinkai_node_manager_guard =
                    SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
                let mut receiver = shinkai_node_manager_guard.subscribe_to_events();
                drop(shinkai_node_manager_guard);
                while let Ok(state_change) = receiver.recv().await {
                    app_handle
                        .emit_all("shinkai-node-state-change", state_change)
                        .unwrap_or_else(|e| {
                            println!("Failed to emit global event for state change: {}", e);
                        });
                }
            });

            app.global_shortcut_manager()
                .register("CmdOrCtrl+y", move || match app_clone.get_window("main") {
                    Some(window) => {
                        if let Err(e) = app_clone.emit_all("navigate-job-and-focus", ()) {
                            println!("Failed to emit 'navigate-job-and-focus': {}", e);
                        }

                        if let Err(e) = window.set_focus() {
                            println!("Failed to set focus: {}", e);
                        }
                    }
                    None => {
                        println!("Failed to get main window");
                    }
                })
                .unwrap_or_else(|e| {
                    println!("Failed to register shortcut: {}", e);
                });
            Ok(())
        })
        .system_tray(system_tray)
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a left click");
            }
            SystemTrayEvent::RightClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _,
                size: _,
                ..
            } => {
                println!("system tray received a double click");
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "hide_show" => {
                    let window = app.get_window("main").unwrap();
                    let menu_item = app.tray_handle().get_item("hide_show");
                    if window.is_visible().unwrap() {
                        window.hide().unwrap();
                        let _ = menu_item.set_title("Show");
                    } else {
                        window.show().unwrap();
                        window.center().unwrap();
                        let _ = menu_item.set_title("Hide");
                    }
                }
                "open_shinkai_node_manager_window" => {
                    let shinkai_node_manager_window = "shinkai-node-manager-window".to_string();
                    let existing_window = app.get_window(&shinkai_node_manager_window);
                    if let Some(window) = existing_window {
                        let _ = window.set_focus();
                        return;
                    }
                    let new_window = tauri::WindowBuilder::new(
                        app,
                        shinkai_node_manager_window,
                        tauri::WindowUrl::App("src/windows/shinkai-node-manager/index.html".into()),
                    )
                    .build()
                    .unwrap();
                    let _ = new_window.set_title("Shinkai Node Manager");
                    let _ = new_window.set_resizable(true);
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
                _ => {}
            },
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(move |_app_handle, event| match event {
            RunEvent::ExitRequested { .. } => {
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
            RunEvent::Exit => {}
            RunEvent::WindowEvent {
                label: _, event: _, ..
            } => {}
            RunEvent::Ready => {}
            RunEvent::Resumed => {}
            RunEvent::MainEventsCleared => {}
            _ => {}
        });
}
