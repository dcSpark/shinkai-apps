// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Arc;

use crate::commands::fetch::{get_request, post_request};
use crate::commands::galxe::galxe_generate_proof;
use crate::commands::hardware::hardware_get_summary;
use crate::commands::shinkai_node_manager_commands::{
    shinkai_node_get_default_model, shinkai_node_get_last_n_logs, shinkai_node_get_ollama_api_url,
    shinkai_node_get_options, shinkai_node_is_running, shinkai_node_kill,
    shinkai_node_remove_storage, shinkai_node_set_default_options, shinkai_node_set_options,
    shinkai_node_spawn, show_shinkai_node_manager_window,
};

use commands::spotlight_commands::hide_spotlight_window_app;
use global_shortcuts::global_shortcut_handler;
use globals::SHINKAI_NODE_MANAGER_INSTANCE;
use local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;
use tauri::{Emitter, WindowEvent};
use tauri::{Manager, RunEvent};
use tokio::sync::Mutex;
use tray::create_tray;
use windows::Window;

mod audio;
mod commands;
mod galxe;
mod global_shortcuts;
mod globals;
mod hardware;
mod local_shinkai_node;
mod tray;
mod windows;

#[derive(Clone, serde::Serialize)]
struct Payload {
    args: Vec<String>,
    cwd: String,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_single_instance::init(|app, argv, cwd| {
            app.emit("single-instance", Payload { args: argv, cwd })
                .unwrap();
        }))
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_shortcuts([
                    "super+shift+i",
                    "control+shift+i",
                    "super+shift+j",
                    "control+shift+j",
                ])
                .unwrap()
                .with_handler(
                    |app: &tauri::AppHandle,
                     shortcut: &tauri_plugin_global_shortcut::Shortcut,
                     event: tauri_plugin_global_shortcut::ShortcutEvent| {
                        global_shortcut_handler(app, *shortcut, event)
                    },
                )
                .build(),
        )
        .invoke_handler(tauri::generate_handler![
            hide_spotlight_window_app,
            show_shinkai_node_manager_window,
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
            galxe_generate_proof,
            get_request,
            post_request,
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
                                log::error!("failed to emit global event for state change: {}", e);
                            });
                    }
                }
            });

            create_tray(app.handle())?;

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(move |app_handle, event| match event {
            RunEvent::ExitRequested { api, .. } => {
                api.prevent_exit();
            }
            RunEvent::Exit { .. } => {
                tauri::async_runtime::spawn(async {
                    log::debug!("killing ollama and shinkai-node before exit");

                    // For some reason process::exit doesn't fire RunEvent::ExitRequested event in tauri
                    let mut shinkai_node_manager_guard =
                        SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
                    shinkai_node_manager_guard.kill().await;

                    // Force exit the application
                    std::process::exit(0);
                });
            }
            #[cfg(target_os = "macos")]
            RunEvent::Reopen { .. } => {
                let main_window_label = "main";
                if let Some(window) = app_handle.get_webview_window(main_window_label) {
                    window.show().unwrap();
                    window.center().unwrap();
                    let _ = window.set_focus();
                } else {
                    let main_window_config = app_handle
                        .config()
                        .app
                        .windows
                        .iter()
                        .find(|w| w.label == main_window_label)
                        .unwrap()
                        .clone();
                    match tauri::WebviewWindowBuilder::from_config(app_handle, &main_window_config)
                    {
                        Ok(builder) => {
                            if let Err(e) = builder.build() {
                                log::error!("failed to build main window: {}", e);
                            }
                        }
                        Err(e) => {
                            log::error!("failed to create WebviewWindowBuilder from config: {}", e);
                        }
                    }
                }
            }
            RunEvent::Ready => {}
            RunEvent::Resumed => {}
            RunEvent::MainEventsCleared => {}
            RunEvent::WindowEvent {
                label,
                event: WindowEvent::Focused(focused),
                ..
            } => match label {
                label if label == Window::Spotlight.as_str() => {
                    if !focused {
                        if let Some(spotlight_window) =
                            app_handle.get_webview_window(Window::Spotlight.as_str())
                        {
                            if spotlight_window.is_visible().unwrap_or(false) {
                                let _ = spotlight_window.hide();
                            }
                        }
                    }
                }
                _ => {}
            },
            _ => {}
        });
}
