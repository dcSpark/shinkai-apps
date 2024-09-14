use std::{path::PathBuf, time::Duration};

use regex::Regex;
use serde::Serialize;
use tauri::AppHandle;
use tokio::sync::mpsc::Sender;

use crate::local_shinkai_node::ollama_api::ollama_api_client::OllamaApiClient;

use super::{
    logger::LogEntry,
    process_handler::{ProcessHandler, ProcessHandlerEvent},
    process_utils::{kill_process_by_name, kill_process_by_pid, options_to_env},
};

#[derive(Serialize, Clone)]
pub struct OllamaOptions {
    pub ollama_host: String,
    pub ollama_num_parallel: String,
    pub ollama_max_loaded_models: String,
    pub ollama_origins: String,
    pub ollama_debug: String,
    pub ollama_runners_dir: Option<String>,
}

impl Default for OllamaOptions {
    fn default() -> Self {
        Self {
            ollama_host: "127.0.0.1:11435".to_string(),
            ollama_num_parallel: "1".to_string(),
            ollama_max_loaded_models: "2".to_string(),
            ollama_origins: "*".to_string(),
            ollama_debug: "true".to_string(),
            ollama_runners_dir: None,
        }
    }
}

impl OllamaOptions {
    pub fn with_app_options(app_resource_dir: PathBuf) -> Self {
        let ollama_runners_dir = if cfg!(target_os = "windows") {
            Some(
                app_resource_dir
                    .join("external-binaries/ollama/lib/ollama/runners")
                    .to_string_lossy()
                    .to_string(),
            )
        } else {
            None
        };
        Self {
            ollama_runners_dir,
            ..Default::default()
        }
    }
}

pub struct OllamaProcessHandler {
    app: AppHandle,
    process_handler: ProcessHandler,
    app_resource_dir: PathBuf,
    options: OllamaOptions,
}

impl OllamaProcessHandler {
    const HEALTH_TIMEOUT_MS: u64 = 5000;
    const PROCESS_NAME: &'static str = "ollama";
    const READY_MATCHER: &'static str = "Listening on ";

    pub fn new(
        app: AppHandle,
        event_sender: Sender<ProcessHandlerEvent>,
        app_resource_dir: PathBuf,
    ) -> Self {
        let ready_matcher = Regex::new(Self::READY_MATCHER).unwrap();
        let process_handler = ProcessHandler::new(
            app.clone(),
            Self::PROCESS_NAME.to_string(),
            event_sender,
            ready_matcher,
        );
        let options = OllamaOptions::with_app_options(app_resource_dir.clone());
        OllamaProcessHandler {
            app,
            process_handler,
            app_resource_dir,
            options,
        }
    }

    pub fn get_options(&self) -> OllamaOptions {
        self.options.clone()
    }

    pub fn get_ollama_api_base_url(&self) -> String {
        let base_url: String = format!("http://{}", self.options.ollama_host);
        base_url
    }

    async fn wait_ollama_server(&self) -> Result<(), String> {
        let timeout = Duration::from_millis(Self::HEALTH_TIMEOUT_MS);
        let start_time = std::time::Instant::now();
        let ollama_api = OllamaApiClient::new(self.get_ollama_api_base_url());
        tokio::select! {
            _ = tokio::time::sleep(timeout) => {
                let elapsed = start_time.elapsed();
                Err(format!("wait ollama server timeout after {}ms", elapsed.as_millis()))
            }
            _ = tokio::spawn(async move {
                loop {
                    match ollama_api.health().await {
                        Ok(true) => break,
                        Ok(false) | Err(_) => tokio::time::sleep(Duration::from_millis(50)).await
                    }
                }
            }) => {
                Ok(())
            }
        }
    }

    pub async fn spawn(&self, ensure_model: Option<&str>) -> Result<(), String> {
        let _ = self.kill_existing_processes_using_ports().await;

        let ollama_process_cwd = if cfg!(target_os = "windows") {
            Some(PathBuf::from(
                self.app_resource_dir
                    .clone()
                    .join("external-binaries/ollama")
                    .to_string_lossy()
                    .to_string(),
            ))
        } else {
            None
        };
        let env = options_to_env(&self.options);
        self.process_handler
            .spawn(env, ["serve"].to_vec(), ollama_process_cwd)
            .await?;
        if let Err(e) = self.wait_ollama_server().await {
            self.process_handler.kill().await;
            return Err(e);
        }
        let ollama_api = OllamaApiClient::new(self.get_ollama_api_base_url());
        if let Some(model) = ensure_model {
            if let Err(e) = ollama_api.pull(model).await {
                self.process_handler.kill().await;
                return Err(e.to_string());
            }
        }
        Ok(())
    }

    pub async fn get_last_n_logs(&self, n: usize) -> Vec<LogEntry> {
        self.process_handler.get_last_n_logs(n).await
    }

    pub async fn is_running(&self) -> bool {
        self.process_handler.is_running().await
    }

    async fn kill_existing_processes_using_ports(&self) -> Result<(), String> {
        // Extract port from ollama_host
        let port = self.options.ollama_host.split(':').nth(1)
            .ok_or_else(|| "invalid ollama_host format".to_string())?
            .parse::<u16>()
            .map_err(|_| "invalid port number".to_string())?;

        // Get processes by port
        let processes = listeners::get_processes_by_port(port)
            .map_err(|e| format!("failed to get processes: {}", e))?;

        // Kill all existing processes using the same port
        for process in processes {
            kill_process_by_pid(self.app.clone(), &process.pid.to_string()).await;
        }
        Ok(())
    }

    pub async fn kill(&self) {
        kill_process_by_name(self.app.clone(), "ollama_llama_server").await;
        self.process_handler.kill().await;
        let _ = self.kill_existing_processes_using_ports().await;
    }
}
