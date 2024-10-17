use std::sync::Arc;

use axum::{extract::State, http::StatusCode, response::IntoResponse, routing::post, Json, Router};
use futures_util::{FutureExt, TryFutureExt};
use log::debug;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter, EventTarget, Listener};

use crate::windows::Window;

#[derive(Deserialize, Debug)]
struct RunCodeRequest {
    parameters: Value,
    configurations: Value,
    code: String,
}

// the output to our `create_user` handler
#[derive(Serialize)]
struct RunCodeResponse {
    result: Value,
}

#[derive(Serialize, Clone)]
struct RunPythonCodeRequestEventPayload {
    id: String,
    parameters: Value,
    configurations: Value,
    code: String,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct RunPythonCodeResponseEventPayload {
    result: Value,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct RunPythonCodeResponseErrorEventPayload {
    message: String,
}

async fn run_code(
    State(app_handle): State<AppHandle>,
    Json(payload): Json<RunCodeRequest>,
) -> Result<Json<RunCodeResponse>, StatusCode> {
    // (StatusCode::OK, "asda")
    log::info!("api /run-code {:?}", payload);
    let id = uuid::Uuid::new_v4().to_string();
    let _ = app_handle.emit_to(
        EventTarget::webview_window(Window::PythonCodeRunner.as_str()),
        "run-python-code-request",
        RunPythonCodeRequestEventPayload {
            id: id.clone(),
            parameters: payload.parameters,
            configurations: payload.configurations,
            code: payload.code,
        },
    );
    let run_python_code_response_event_str = format!("run-python-code-response-{}", id);
    let run_python_code_response_error_event_str = format!("run-python-code-response-error-{}", id);
    let (tx, mut rx) = tokio::sync::mpsc::channel::<Option<serde_json::Value>>(1);

    let tx_clone = tx.clone();
    tokio::spawn(async move {
        tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        log::info!("execution timeout 30s");
        let _ = tx_clone.send(None).await;
    });

    let app_handle_clone = app_handle.clone();
    let tx_clone = tx.clone();
    tokio::spawn(async move {
        debug!(
            "liteninig code response {}",
            run_python_code_response_event_str.clone()
        );
        app_handle_clone.once(
            run_python_code_response_event_str.clone(),
            move |event: tauri::Event| {
                log::info!("{} {:?}", run_python_code_response_event_str.clone(), event);
                let event: RunPythonCodeResponseEventPayload =
                    serde_json::from_str(event.payload())
                        .expect("failed to deserialize event payload");
                log::info!("{:?}", event);
                let _ = tx_clone.blocking_send(Some(
                    serde_json::to_value(event).expect("failed to serialize event"),
                ));
            },
        );
    });

    let app_handle_clone = app_handle.clone();
    let tx_clone = tx.clone();
    tokio::spawn(async move {
        app_handle_clone.once(
            run_python_code_response_error_event_str,
            move |event: tauri::Event| {
                let event: RunPythonCodeResponseErrorEventPayload =
                    serde_json::from_str(&event.payload())
                        .expect("failed to deserialize error event payload");
                log::info!("{:?}", event);
                let _ = tx_clone.blocking_send(Some(
                    serde_json::to_value(event).expect("failed to serialize event"),
                ));
            },
        )
    });

    let result = rx.recv().await;
    if let Some(Some(event)) = result {
        match event {
            serde_json::Value::Object(event) => {
                if let Some(result) = event.get("result") {
                    // Handle RunPythonCodeResponseEventPayload
                    log::info!("python code execution successful: {:?}", result);
                    Ok(Json(RunCodeResponse {
                        result: result.clone(),
                    }))
                } else if let Some(message) = event.get("message") {
                    // Handle RunPythonCodeResponseErrorEventPayload
                    log::error!("python code execution failed: {:?}", message);
                    return Err(StatusCode::INTERNAL_SERVER_ERROR);
                } else {
                    log::error!("invalid event format received");
                    return Err(StatusCode::BAD_REQUEST);
                }
            }
            _ => {
                log::error!("invalid event format received");
                Err(StatusCode::BAD_REQUEST)
            }
        }
    } else {
        log::info!("Timeout reached before receiving a response");
        Err(StatusCode::INTERNAL_SERVER_ERROR)
    }
}

pub async fn init(app_handle: AppHandle, port: usize) {
    let address = format!("0.0.0.0:{}", port);
    log::info!("initializing external api {}", address.clone());
    let app = Router::new().route("/run-code", post(run_code).with_state(app_handle.clone()));

    log::info!("binding address {}", address.clone());
    let listener = match tokio::net::TcpListener::bind(address.clone()).await {
        Ok(listener) => listener,
        Err(e) => {
            log::error!("failed to bind to {}: {}", address.clone(), e);
            return;
        }
    };
    log::info!("port bound successfully {}", address.clone());
    if let Err(e) = axum::serve(listener, app).await {
        log::error!("failed to serve external API: {}", e);
    }
    log::info!("external api initialized");
}
