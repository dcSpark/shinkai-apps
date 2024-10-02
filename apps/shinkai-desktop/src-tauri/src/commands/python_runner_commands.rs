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



#[tauri::command]
pub async fn python_runner_run(app_handle: tauri::AppHandle, code: String) -> Result<ExecutionResult, String> {
    let python_runner_window = create_window(app_handle, Window::PythonRunner).map_err(|e| e.to_string())?;
    let python_runner_window_clone = python_runner_window.clone();
    let (tx, rx) = tokio::sync::oneshot::channel();

    python_runner_window_clone.once("ready", move |_| {
        log::debug!("python runner ready");
        let _ = tx.send(());
    });
    let _ = rx.await;

    let (tx_result, mut rx_result) = tokio::sync::oneshot::channel::<ExecutionResult>();

    let _ = python_runner_window.emit_to(python_runner_window.label(), "run", code);
    python_runner_window_clone.once("execution-result", move |result: Event| {
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
    let result_value = rx_result.await.map_err(|e| e.to_string())?; // Get the result value
    Ok(result_value)
}
