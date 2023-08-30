use std::collections::HashMap;

use tauri::api::process::Command;

/// Converts any object to a HashMap for environment variables.
pub fn options_to_env<T: serde::Serialize>(options: &T) -> HashMap<String, String> {
    let mut env = HashMap::new();
    let options_reflection = serde_json::to_value(options).unwrap();
    for (key, value) in options_reflection.as_object().unwrap() {
        let env_key = key.to_uppercase();
        let env_value = value.as_str().unwrap_or_default().to_string();
        env.insert(env_key, env_value);
    }
    env
}

pub fn kill_process_by_name(process_name: &str) {
    let adapted_process_name = if cfg!(target_os = "windows") {
        format!("{}.exe", process_name).to_string()
    } else {
        process_name.to_string()
    };
    let output = if cfg!(target_os = "windows") {
        // Windows: Use taskkill command
        Command::new("taskkill")
            .args(["/F", "/IM", &adapted_process_name])
            .output()
    } else {
        // Unix-like systems: Use pkill command
        Command::new("pkill").args(["-15", &adapted_process_name]).output()
    };
    if let Ok(output) = output {
        if output.status.success() {
            println!("existing process '{}' has been terminated.", adapted_process_name);
        } else {
            println!(
                "failed to terminate process '{}'. Error: {}",
                adapted_process_name, output.stderr
            );
        }
    } else {
        println!("failed to execute command to terminate process");
    }
}
