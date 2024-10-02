use tauri::{Emitter, Event, Listener};

use crate::windows::{create_window, Window};

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub enum ExecutionState {
    #[serde(rename = "success")]
    Success,
    #[serde(rename = "error")]
    Error,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ExecutionResult {
    pub state: ExecutionState,
    pub payload: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoadingProgress {
    pub step: String,
    pub progress: u8,
}

use std::time::Duration;
use tokio::time::sleep;

#[tauri::command]
pub async fn python_runner_run(app_handle: tauri::AppHandle, code: String) -> Result<ExecutionResult, String> {
    let python_runner_window = create_window(app_handle, Window::PythonRunner).map_err(|e| e.to_string())?;
    let python_runner_window_clone = python_runner_window.clone();

    // Wait for the "ready" event with a timeout
    let (tx_ready, rx_ready) = tokio::sync::oneshot::channel();
    let ready_listener = python_runner_window_clone.once("ready", move |_| {
        let _ = tx_ready.send(());
    });

    // Wait for up to 30 seconds for the "ready" event
    tokio::select! {
        _ = rx_ready => {
            log::debug!("Python runner is ready");
        }
        _ = sleep(Duration::from_secs(30)) => {
            python_runner_window.unlisten(ready_listener);
            return Err("Timeout waiting for Python runner to be ready".to_string());
        }
    }

    let mut progress_listener = python_runner_window_clone.listen("loading-progress", move |event: Event| {
        if let Ok(progress) = serde_json::from_str::<LoadingProgress>(event.payload()) {
            log::debug!("Loading progress: {:?}", progress);
            // Here you can emit the progress to the main window or handle it as needed
            // For example:
            // app_handle.emit_all("python-loading-progress", progress).unwrap();
        }
    });

    // Create a channel for the execution result
    let (tx_result, rx_result) = tokio::sync::oneshot::channel();

    let execution_listener = python_runner_window_clone.once("execution-result", move |result: Event| {
        log::debug!("python runner execution result {:?}", result.payload());
        if let Ok(execution_result) = serde_json::from_str::<ExecutionResult>(result.payload()) {
            let _ = tx_result.send(execution_result);
        } else {
            let _ = tx_result.send(ExecutionResult {
                state: ExecutionState::Error,
                payload: Some(serde_json::json!({ "error": "failed to deserialize execution result" })),
            });
        }
    });

    // Emit the 'run' event to the Python runner window
    python_runner_window.emit("run", code).map_err(|e| e.to_string())?;

    // Wait for the execution result
    let result_value = rx_result.await.map_err(|e| e.to_string())?;

    // Don't forget to unlisten the listeners
    python_runner_window.unlisten(progress_listener);
    python_runner_window.unlisten(execution_listener);

    Ok(result_value)
}
