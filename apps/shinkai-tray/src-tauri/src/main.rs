// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, GlobalShortcutManager, RunEvent, SystemTray, SystemTrayEvent, SystemTrayMenu};
use tauri::{Manager, SystemTrayMenuItem};
use tauri::api::dialog::message;

mod audio;

mod local_shinkai_node;

use crate::local_shinkai_node::shinkai_node_manager_instance::SHINKAI_NODE_MANAGER_INSTANCE;
use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;


#[tauri::command]
fn shinkai_node_is_running() -> Result<bool, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
    let is_running = shinkai_node_manager_guard.is_running();
    Ok(is_running)
}

#[tauri::command]
fn shinkai_node_get_last_n_logs(length: usize) -> Result<Vec<String>, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
    let logs = shinkai_node_manager_guard.get_last_n_logs(length);
    Ok(logs)
}

#[tauri::command]
fn shinkai_node_set_options(options: ShinkaiNodeOptions) -> Result<ShinkaiNodeOptions, String> {
    let mut shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
    let options = shinkai_node_manager_guard.set_options(options);
    Ok(options)
}

#[tauri::command]
fn shinkai_node_get_options() -> Result<ShinkaiNodeOptions, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
    let options = shinkai_node_manager_guard.get_options();
    Ok(options)
}

#[tauri::command]
fn shinkai_node_spawn() -> Result<(), String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
    match shinkai_node_manager_guard.spawn_shinkai_node() {
        Ok(_) => {
            return Ok(());
        }
        Err(message) => {
            return Err(message);
        }
    }
}

#[tauri::command]
fn shinkai_node_kill() -> Result<String, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
    shinkai_node_manager_guard.kill_shinkai_node();
    Ok("Shinkai Node killed successfully.".into())
}

#[tauri::command]
fn shinkai_node_remove_storage() -> Result<(), String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
    return match shinkai_node_manager_guard.remove_storage() {
        Ok(_) => {
            Ok(())
        }
        Err(message) => {
            Ok(())
        }
    }
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide_show = CustomMenuItem::new("hide_show".to_string(), "Hide");
    let shinkai_node_manager_section_title = CustomMenuItem::new("shinkai_node_manager_section_title".to_string(), "Shinkai Node Manager").disabled();
    let open_shinkai_node_manager_window = CustomMenuItem::new("open_shinkai_node_manager_window".to_string(), "Open");

    let tray_menu = SystemTrayMenu::new()
        .add_item(hide_show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(shinkai_node_manager_section_title)
        .add_item(open_shinkai_node_manager_window)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new()
        .with_menu(tray_menu);

    tauri::Builder::default()
        // .manage(db)
        .invoke_handler(tauri::generate_handler![
            shinkai_node_is_running,
            shinkai_node_get_last_n_logs,
            shinkai_node_get_options,
            shinkai_node_set_options,
            shinkai_node_spawn,
            shinkai_node_kill,
            shinkai_node_remove_storage,
        ])
        .setup(|app| {
            let app_clone = app.app_handle();

            let path = tauri::api::path::resolve_path(
                &app.config(),
                app.package_info(),
                &app.env(),
                "node_storage",
                Some(tauri::api::path::BaseDirectory::AppData)
              )?;
            let mut shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
            shinkai_node_manager_guard.set_options(ShinkaiNodeOptions {
                port: None,
                node_storage_path: Some(path.to_str().unwrap().to_string()),
                unstructured_server_url: None,
                embeddings_server_url: None,
                first_device_needs_registration_code: None,
                initial_agent_names: None,
                initial_agent_urls: None,
                initial_agent_models: None,
                initial_agent_api_keys: None,
                starting_num_qr_devices: None,
            });

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
                "open_shinkai_node_manager_window" => {
                    let shinkai_node_manager_window = "shinkai-node-manager-window".to_string();
                    let existing_window = app.get_window(&shinkai_node_manager_window);
                    if existing_window.is_some() {
                        let _ = existing_window.unwrap().set_focus();
                        return;
                    }
                    let new_window = tauri::WindowBuilder::new(
                        app,
                        shinkai_node_manager_window,
                        tauri::WindowUrl::App("src/windows/shinkai-node-manager/index.html".into()),
                      ).build().unwrap();
                    let _ = new_window.set_title("Shinkai Node Manager");
                    let _ = new_window.set_resizable(false);

                }
                "quit" => {
                    // For some reason process::exit doesn't fire RunEvent::ExitRequested event in tauri
                    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
                    if shinkai_node_manager_guard.is_running() {
                        shinkai_node_manager_guard.kill_shinkai_node();
                    }
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
                let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().unwrap();
                if shinkai_node_manager_guard.is_running() {
                    shinkai_node_manager_guard.kill_shinkai_node();
                }
            }
            _ => {}
        });
}
