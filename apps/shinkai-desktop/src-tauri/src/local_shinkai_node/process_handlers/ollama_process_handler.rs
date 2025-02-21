use std::{path::PathBuf, time::Duration};

use anyhow::Result;
use regex::Regex;
use serde::Serialize;
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;
use tokio::sync::mpsc::Sender;

use crate::local_shinkai_node::ollama_api::ollama_api_client::OllamaApiClient;

use super::{
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
}

impl Default for OllamaOptions {
    fn default() -> Self {
        Self {
            ollama_host: "127.0.0.1:11435".to_string(),
            ollama_num_parallel: "1".to_string(),
            ollama_max_loaded_models: "2".to_string(),
            ollama_origins: "*".to_string(),
            ollama_debug: "true".to_string(),
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
        let options = OllamaOptions::default();
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
        let _ = self.kill().await;

        let env = options_to_env(&self.options);
        self.process_handler
            .spawn(env, ["serve"].to_vec(), None)
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

    pub async fn is_running(&self) -> bool {
        self.process_handler.is_running().await
    }

    async fn kill_existing_processes_using_ports(&self) -> Result<(), String> {
        // Extract port from ollama_host
        let port = self
            .options
            .ollama_host
            .split(':')
            .nth(1)
            .ok_or_else(|| "invalid ollama_host format".to_string())?
            .parse::<u16>()
            .map_err(|_| "invalid port number".to_string())?;

        // Get processes by port
        let processes = listeners::get_processes_by_port(port)
            .map_err(|e| format!("failed to get processes: {}", e))?;

        // Kill all existing processes using the same port
        for process in processes {
            log::info!(
                "terminating process: PID={}, Name={}",
                process.pid,
                process.name
            );
            kill_process_by_pid(self.app.clone(), &process.pid.to_string()).await;
        }
        Ok(())
    }

    pub async fn kill(&self) {
        kill_process_by_name(self.app.clone(), "ollama_llama_server").await;
        self.process_handler.kill().await;
        let _ = self.kill_existing_processes_using_ports().await;
    }

    pub async fn version(app: AppHandle) -> Result<String> {
        let shell = app.shell();
        let output = shell
            .sidecar(Self::PROCESS_NAME)
            .map_err(|error| {
                let message = format!("failed to spawn ollama version, error: {}", error);
                log::info!("{}", message);
                anyhow::anyhow!("{}", message)
            })?
            .args(["-v"])
            .output()
            .await
            .map_err(|error| {
                let message = format!("failed to spawn error: {}", error);
                log::info!("{}", message);
                anyhow::anyhow!("{}", message)
            })?;
        let stdout = String::from_utf8_lossy(&output.stdout);
        log::info!("capturing ollama version from stdout: {:?}", stdout);

        /*
            'client version is *.*.*' is the real ollam version our app is running BUT
            - when embedded and local ollama are equal the message says 'ollama version is *.*.*'
            - when embedded and local are different, the message says 'ollama version is *.*.*... \nWarning client version is *.*.*'

            So we try to find the client version and if it doesn't exists we fallback to ollama version (that means client and local are equals)
        */
        let re = Regex::new(r"client version is (\S+)").unwrap();
        let mut version = re
            .captures(&stdout)
            .and_then(|cap| cap.get(1))
            .map(|m| m.as_str())
            .unwrap_or("");

        if version.is_empty() {
            let re = Regex::new(r"ollama version is (\S+)").unwrap();
            version = re
                .captures(&stdout)
                .and_then(|cap| cap.get(1))
                .map(|m| m.as_str())
                .unwrap_or("");
        }
        log::info!("ollama version {}", version);

        Ok(version.to_string())
    }
}
