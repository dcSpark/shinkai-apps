// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::BackendSpecificError;
use db::db::TrayDB;
use models::setup_data::SetupData;
use shinkai_node::shinkai_node_manager;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, CustomMenuItem, GlobalShortcutManager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu, Wry};
use tauri::{Manager, SystemTrayMenuItem};
use tauri::api::process::{Command, CommandEvent};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext};

mod audio;
mod db;
mod models;
mod shinkai;

mod shinkai_node;

use audio::transcribe::run;
use shinkai::registration::process_onboarding_data;

use crate::shinkai::registration::validate_setup_data;
use crate::shinkai_node::shinkai_node_manager::ShinkaiNodeManager;

enum EmitableEvents {
    CreateJobSection,
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide_show = CustomMenuItem::new("hide_show".to_string(), "Hide");
    let activate_deactivate = CustomMenuItem::new("activate_deactivate".to_string(), "Activate");
    let create_task = CustomMenuItem::new("create_task".to_string(), "Create Task");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let toggle_shinkai_node = CustomMenuItem::new("toggle_shinkai_node".to_string(), "Start Shinkai Node");
    let tray_menu = SystemTrayMenu::new()
        .add_item(hide_show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(activate_deactivate.clone())
        .add_item(create_task)
        .add_item(settings)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(toggle_shinkai_node)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    let is_activated = Arc::new(Mutex::new(false)); // change to true
    let is_activated_clone = Arc::clone(&is_activated);

    let db = TrayDB::new("db/tauri").unwrap();

    // Example usage
    let shinkai_node_manager = Arc::new(Mutex::new(ShinkaiNodeManager::new()));

    let shinkai_node_manager_clone = Arc::clone(&shinkai_node_manager);

    tauri::Builder::default()
        .manage(db)
        .invoke_handler(tauri::generate_handler![process_onboarding_data, validate_setup_data])
        .setup(|app| {
            let app_clone = app.app_handle();

            app.global_shortcut_manager()
                .register("CmdOrCtrl+y", move || {
                    match app_clone.get_window("main") {
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
                position: _, size: _, ..
            } => {
                println!("system tray received a left click");
            }
            SystemTrayEvent::RightClick {
                position: _, size: _, ..
            } => {
                println!("system tray received a right click");
            }
            SystemTrayEvent::DoubleClick {
                position: _, size: _, ..
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
                "activate_deactivate" => {
                    let mut is_activated = is_activated.lock().unwrap();
                    let menu_item = app.tray_handle().get_item("activate_deactivate");
                    if *is_activated {
                        *is_activated = false;
                        let _ = menu_item.set_title("Activate");
                        println!("Feature is now deactivated");
                    } else {
                        *is_activated = true;
                        let _ = menu_item.set_title("Deactivate");
                        println!("Feature is now activated");
                    }
                }
                "create_task" => {
                    let window = app.get_window("main").unwrap();
                    window.emit("create_task", ()).unwrap();
                }
                "settings" => {
                    let window = app.get_window("main").unwrap();
                    window.emit("settings", ()).unwrap();
                }
                "toggle_shinkai_node" => {
                    let shinkai_node_manager = shinkai_node_manager.lock().unwrap();
                    if shinkai_node_manager.is_running() {
                        shinkai_node_manager.kill_shinkai_node();
                        let _ = app.tray_handle().get_item("toggle_shinkai_node").set_title("Start Shinkai Node");
                    } else {
                        shinkai_node_manager.spawn_shinkai_node();
                        let _ = app.tray_handle().get_item("toggle_shinkai_node").set_title("Stop Shinkai Node");
                    }
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .build(tauri::generate_context!())
        .expect("error while running tauri application")
        .run(move |app_handle, event| match event {
            RunEvent::ExitRequested { api, .. } => {
                let shinkai_node_manager = shinkai_node_manager_clone.lock().unwrap();
                if shinkai_node_manager.is_running() {
                    shinkai_node_manager.kill_shinkai_node();
                }
            }
            _ => {}
        });
}

