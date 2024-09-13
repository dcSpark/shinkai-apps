// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;

use crate::commands::galxe::galxe_generate_proof;
use crate::commands::hardware::hardware_get_summary;
use crate::commands::shinkai_node_manager_commands::{
    shinkai_node_get_default_model, shinkai_node_get_last_n_logs, shinkai_node_get_ollama_api_url,
    shinkai_node_get_options, shinkai_node_is_running, shinkai_node_kill,
    shinkai_node_remove_storage, shinkai_node_set_default_options, shinkai_node_set_options,
    shinkai_node_spawn,
};

use globals::SHINKAI_NODE_MANAGER_INSTANCE;
use local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;
use tauri::menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Size};
use tauri::{LogicalSize, Manager, RunEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};
use tokio::sync::Mutex;

mod audio;
mod commands;
mod galxe;
mod globals;
mod hardware;
mod local_shinkai_node;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            // app.emit("single-instance", Payload { args: argv, cwd }).unwrap();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["CmdOrCtrl+y"])
                .unwrap()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed
                        && shortcut.matches(Modifiers::SUPER | Modifiers::CONTROL, Code::KeyY)
                    {
                        if let Some(window) = app.get_webview_window("main") {
                            if let Err(e) = app.emit("navigate-job-and-focus", ()) {
                                println!("Failed to emit 'navigate-job-and-focus': {}", e);
                            }
                            if let Err(e) = window.set_focus() {
                                println!("Failed to set focus: {}", e);
                            }
                        }
                    }
                })
                .build(),
        )
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
            galxe_generate_proof
        ])
        .setup(|app| {
            let app_resource_dir = app.path().resource_dir()?;
            let app_data_dir = app.path().app_data_dir()?;

            {
                let _ = SHINKAI_NODE_MANAGER_INSTANCE.set(Arc::new(Mutex::new(
                    ShinkaiNodeManager::new(app.handle().clone(), app_resource_dir, app_data_dir),
                )));
            }
            // let app_handle = app.handle();
            tauri::async_runtime::spawn({
                let app_handle = app.handle().clone();
                async move {
                    let mut shinkai_node_manager_guard =
                        SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
                    shinkai_node_manager_guard.kill().await;
                    let mut receiver = shinkai_node_manager_guard.subscribe_to_events();
                    drop(shinkai_node_manager_guard);
                    while let Ok(state_change) = receiver.recv().await {
                        app_handle
                            .emit("shinkai-node-state-change", state_change)
                            .unwrap_or_else(|e| {
                                println!("Failed to emit global event for state change: {}", e);
                            });
                    }
                }
            });

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

            let _ = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "hide_show" => {
                        let window = app.get_webview_window("main").unwrap();
                        let menu_item = app.menu().unwrap().get("hide_show");
                        if window.is_visible().unwrap() {
                            window.hide().unwrap();
                            let _ = menu_item.unwrap().as_menuitem().unwrap().set_text("Show");
                        } else {
                            window.show().unwrap();
                            window.center().unwrap();
                            let _ = menu_item.unwrap().as_menuitem().unwrap().set_text("Hide");
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
                            tauri::WebviewUrl::App(
                                "src/windows/shinkai-node-manager/index.html".into(),
                            ),
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
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(move |_app_handle, event| match event {
            RunEvent::ExitRequested { .. } => {
                tauri::async_runtime::spawn(async {
                    // For some reason process::exit doesn't fire RunEvent::ExitRequested event in tauri
                    let mut shinkai_node_manager_guard =
                        SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
                    shinkai_node_manager_guard.kill().await;
                    std::process::exit(0);
                });
            }
            RunEvent::Exit => {
                tauri::async_runtime::spawn(async {
                    // For some reason process::exit doesn't fire RunEvent::ExitRequested event in tauri
                    let mut shinkai_node_manager_guard =
                        SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
                    shinkai_node_manager_guard.kill().await;
                    std::process::exit(0);
                });
            }
            RunEvent::WindowEvent {
                label: _, event: _, ..
            } => {}
            RunEvent::Ready => {}
            RunEvent::Resumed => {}
            RunEvent::MainEventsCleared => {}
            _ => {}
        });
}
