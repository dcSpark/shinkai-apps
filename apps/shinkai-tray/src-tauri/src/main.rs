// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use db::db::TrayDB;
use std::sync::{Arc, Mutex};
use tauri::{CustomMenuItem, GlobalShortcutManager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri::{Manager, SystemTrayMenuItem};
use std::sync::OnceLock;

mod audio;
mod db;
mod models;
mod shinkai;

mod local_shinkai_node;

use shinkai::registration::process_onboarding_data;

use crate::shinkai::registration::validate_setup_data;
use crate::local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;


static SHINKAI_NODE_MANAGER: OnceLock<Arc<Mutex<ShinkaiNodeManager>>> = OnceLock::new();

#[tauri::command]
fn shinkai_node_is_running() -> Result<bool, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER.get().unwrap().lock().unwrap();
    let is_running = shinkai_node_manager_guard.is_running();
    Ok(is_running)
}

#[tauri::command]
fn shinkai_node_get_last_n_logs(length: usize) -> Result<Vec<String>, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER.get().unwrap().lock().unwrap();
    let logs = shinkai_node_manager_guard.get_last_n_logs(length);
    Ok(logs)
}

#[tauri::command]
fn shinkai_node_spawn() -> Result<String, String> {
    println!("command:shinkai_node_spawn");
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER.get().unwrap().lock().unwrap();
    match shinkai_node_manager_guard.spawn_shinkai_node() {
        Ok(_) => {
            return Ok("Shinkai Node spawned successfully.".into());
        }
        Err(message) => {
            return Err(format!("Failed to spawn Shinkai Node error:{:?}", message).into());
        }
    }
}

#[tauri::command]
fn shinkai_node_kill() -> Result<String, String> {
    println!("command:shinkai_node_kill");
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER.get().unwrap().lock().unwrap();
    shinkai_node_manager_guard.kill_shinkai_node();
    Ok("Shinkai Node killed successfully.".into())
}

fn main() {
    SHINKAI_NODE_MANAGER.get_or_init(|| {
        Arc::new(Mutex::new(ShinkaiNodeManager::new(None)))
    });
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide_show = CustomMenuItem::new("hide_show".to_string(), "Hide");
    let activate_deactivate = CustomMenuItem::new("activate_deactivate".to_string(), "Activate");
    let create_task = CustomMenuItem::new("create_task".to_string(), "Create Task");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let open_shinkai_node_manager_window = CustomMenuItem::new("open_shinkai_node_manager_window".to_string(), "Open Shinkai Node Manager");
    let toggle_shinkai_node = CustomMenuItem::new("toggle_shinkai_node".to_string(), "Start Shinkai Node");
    let tray_menu = SystemTrayMenu::new()
        .add_item(hide_show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(activate_deactivate.clone())
        .add_item(create_task)
        .add_item(settings)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(open_shinkai_node_manager_window)
        .add_item(toggle_shinkai_node)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new()
        .with_menu(tray_menu);

    let is_activated = Arc::new(Mutex::new(false)); // change to true

    let db = TrayDB::new("db/tauri").unwrap();

    // Example usage
    // let SHINKAI_NODE_MANAGER = Arc::new(Mutex::new(ShinkaiNodeManager::new(None)));

    tauri::Builder::default()
        .manage(db)
        .invoke_handler(tauri::generate_handler![
            process_onboarding_data,
            validate_setup_data,
            shinkai_node_is_running,
            shinkai_node_get_last_n_logs,
            shinkai_node_spawn,
            shinkai_node_kill,
        ])
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
                "open_shinkai_node_manager_window" => {
                    let existing_window = app.get_window("shinkai-node-manager");
                    if existing_window.is_some() {
                        let _ = existing_window.unwrap().set_focus();
                        return;
                    }
                    let new_window = tauri::WindowBuilder::new(
                        app,
                        "shinkai-node-manager",
                        tauri::WindowUrl::App("src/windows/shinkai-node-manager/index.html".into()),
                      ).build().unwrap();
                    let _ = new_window.set_title("Shinkai Node Manager");
                    let _ = new_window.set_resizable(false);

                }
                "toggle_shinkai_node" => {
                    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER.get().unwrap().lock().unwrap();
                    if shinkai_node_manager_guard.is_running() {
                        shinkai_node_manager_guard.kill_shinkai_node();
                        let _ = app.tray_handle().get_item("toggle_shinkai_node").set_title("Start Shinkai Node");
                    } else {
                        let _ = match shinkai_node_manager_guard.spawn_shinkai_node() {
                            Ok(..) => println!("shinkai-node spawned"),
                            Err(error) => {
                                println!("shinkai-node spawn failed error: {:?}", error);
                            },
                        };
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
                let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER.get().unwrap().lock().unwrap();
                if shinkai_node_manager_guard.is_running() {
                    shinkai_node_manager_guard.kill_shinkai_node();
                }
            }
            _ => {}
        });
}

