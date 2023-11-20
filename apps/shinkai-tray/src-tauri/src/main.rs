// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::BackendSpecificError;
use db::db::TrayDB;
use models::setup_data::SetupData;
use std::sync::{Arc, Mutex};
use std::thread;
use tauri::{AppHandle, CustomMenuItem, GlobalShortcutManager, SystemTray, SystemTrayEvent, SystemTrayMenu, Wry};
use tauri::{Manager, SystemTrayMenuItem};
use whisper_rs::{FullParams, SamplingStrategy, WhisperContext};

mod audio;
mod db;
mod models;
mod shinkai;

use audio::transcribe::run;
use shinkai::registration::process_onboarding_data;

use crate::shinkai::registration::validate_setup_data;

enum EmitableEvents {
    CreateJobSection,
}



fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide_show = CustomMenuItem::new("hide_show".to_string(), "Hide");
    let activate_deactivate = CustomMenuItem::new("activate_deactivate".to_string(), "Activate");
    let create_task = CustomMenuItem::new("create_task".to_string(), "Create Task");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");

    let tray_menu = SystemTrayMenu::new()
        .add_item(hide_show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(activate_deactivate.clone())
        .add_item(create_task)
        .add_item(settings)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    let is_activated = Arc::new(Mutex::new(false)); // change to true
    let is_activated_clone = Arc::clone(&is_activated);

    // // Create a new WhisperContext
    // let ctx = Arc::new(Mutex::new(
    //     WhisperContext::new("./models/ggml-base-q5_1.bin").expect("failed to load model"),
    // ));
    // let ctx_clone = Arc::clone(&ctx);

    // // Start a new thread for audio capture
    // thread::spawn(move || {
    //     let host = cpal::default_host();
    //     let device = host
    //         .input_devices()
    //         .unwrap()
    //         .find(|d| d.name().unwrap() == "MacBook Pro Microphone")
    //         .expect("Failed to get MacBook Pro Microphone");

    //     println!("Selected input device: {}", device.name().unwrap());
    //     println!("Default input config: {:?}", device.default_input_config().unwrap());

    //     let config = device
    //         .default_input_config()
    //         .expect("Failed to get default input config");

    //     let err_fn = |err| eprintln!("an error occurred on stream: {}", err);

    //     match config.sample_format() {
    //         cpal::SampleFormat::F32 => run::<f32>(&device, config.into(), err_fn, is_activated_clone, ctx_clone),
    //         cpal::SampleFormat::I16 => run::<i16>(&device, config.into(), err_fn, is_activated_clone, ctx_clone),
    //         cpal::SampleFormat::U16 => run::<u16>(&device, config.into(), err_fn, is_activated_clone, ctx_clone),
    //         _ => panic!("unsupported sample format"),
    //     }
    // });

    let db = TrayDB::new("db/tauri").unwrap();


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
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// Previous

// // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// fn main() {
//     tauri::Builder::default()
//         .invoke_handler(tauri::generate_handler![greet])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
