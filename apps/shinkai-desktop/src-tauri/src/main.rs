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
use tauri::Emitter;
use tauri::{Manager, RunEvent};
use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};
use tokio::sync::Mutex;
use tray::create_tray;

mod audio;
mod commands;
mod galxe;
mod globals;
mod hardware;
mod local_shinkai_node;
mod tray;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            println!("{}, {argv:?}, {cwd}", app.package_info().name);
            app.emit("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts(["super+shift+i", "control+shift+i"])
                .unwrap()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed
                        && shortcut.matches(Modifiers::SUPER | Modifiers::SHIFT, Code::KeyI)
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
                                println!("failed to emit global event for state change: {}", e);
                            });
                    }
                }
            });

            create_tray(app.handle())?;

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

                    // Force exit the application
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
