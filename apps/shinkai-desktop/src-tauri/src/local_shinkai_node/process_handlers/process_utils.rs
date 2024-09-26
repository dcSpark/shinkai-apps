use std::collections::HashMap;

use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;

/// Converts any object to a HashMap for environment variables.
pub fn options_to_env<T: serde::Serialize>(options: &T) -> HashMap<String, String> {
    let mut env = HashMap::new();
    let options_reflection = serde_json::to_value(options).unwrap();
    for (key, value) in options_reflection.as_object().unwrap() {
        let env_key = key.to_uppercase();
        if let Some(env_value) = value.as_str() {
            env.insert(env_key, env_value.to_string());
        }
    }
    env
}

pub async fn kill_process_by_name(app: AppHandle, process_name: &str) {
    let adapted_process_name = if cfg!(target_os = "windows") {
        format!("{}.exe", process_name).to_string()
    } else if cfg!(target_os = "linux") {
        // For linux pkill pattern just supports 15 characters
        process_name.chars().take(15).collect::<String>()
    } else {
        process_name.to_string()
    };
    let output = if cfg!(target_os = "windows") {
        // Windows: Use taskkill command
        app.shell()
            .command("taskkill")
            .args(["/F", "/IM", &adapted_process_name])
            .output()
    } else {
        // Unix-like systems: Use pkill command
        app.shell()
            .command("pkill")
            .args(["-15", &adapted_process_name])
            .output()
    };
    if let Ok(output) = output.await {
        if output.status.success() {
            log::info!(
                "existing process '{}' has been terminated.",
                adapted_process_name
            );
        } else {
            log::warn!(
                "failed to terminate process '{}'. Error: {}",
                adapted_process_name,
                String::from_utf8_lossy(&output.stderr)
            );
        }
    } else {
        log::error!("failed to execute command to terminate process");
    }
}

pub async fn kill_existing_processes_using_ports(
    app: AppHandle,
    ports: Vec<&str>,
) -> Result<(), String> {
    for port_str in ports {
        let port = port_str
            .parse::<u16>()
            .map_err(|_| format!("Invalid port number: {}", port_str))?;

        // Get processes by port
        let processes = listeners::get_processes_by_port(port)
            .map_err(|e| format!("Failed to get processes for port {}: {}", port, e))?;

        // Kill all existing processes using the same port
        for process in processes {
            log::info!(
                "terminating process: PID={}, Name={}",
                process.pid, process.name
            );
            kill_process_by_pid(app.clone(), &process.pid.to_string()).await;
        }
    }
    Ok(())
}

pub async fn kill_process_by_pid(app: AppHandle, process_id: &str) {
    let output = if cfg!(target_os = "windows") {
        // windows: use taskkill command
        app.shell()
            .command("taskkill")
            .args(["/F", "/PID", process_id])
            .output()
    } else {
        app.shell()
            .command("kill")
            .args(["-15", process_id])
            .output()
    };
    if let Ok(output) = output.await {
        if output.status.success() {
            log::info!("process with PID '{}' has been terminated.", process_id);
        } else {
            log::warn!(
                "failed to terminate process with PID '{}'. error: {}",
                process_id,
                String::from_utf8_lossy(&output.stderr)
            );
        }
    } else {
        log::error!("failed to execute command to terminate process");
    }
}
