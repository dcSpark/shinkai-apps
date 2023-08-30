use regex::Regex;
use serde::Serialize;
use tokio::sync::mpsc::Sender;

use crate::local_shinkai_node::ollama_api::ollama_api_client::OllamaApiClient;

use super::{
    logger::LogEntry, process_handler::{ProcessHandler, ProcessHandlerEvent}, process_utils::{kill_process_by_name, options_to_env}
};

#[derive(Serialize, Clone)]
pub struct OllamaOptions {
    pub ollama_host: String,
    pub ollama_num_parallel: String,
    pub ollama_max_loaded_models: String,
    pub ollama_origins: String,
}

pub struct OllamaProcessHandler {
    process_handler: ProcessHandler,
    options: OllamaOptions,
}

impl OllamaProcessHandler {
    const HEALTH_TIMEOUT_MS: u64 = 500;
    const PROCESS_NAME: &'static str = "ollama";
    const READY_MATCHER: &'static str = "Listening on ";

    pub fn new(options: Option<OllamaOptions>, event_sender: Sender<ProcessHandlerEvent>) -> Self {
        let ready_matcher = Regex::new(Self::READY_MATCHER).unwrap();
        Self::kill_llama_process();
        let process_handler = ProcessHandler::new(Self::PROCESS_NAME.to_string(), event_sender, ready_matcher);
        OllamaProcessHandler {
            process_handler,
            options: options.unwrap_or(Self::default_options()),
        }
    }

    pub fn default_options() -> OllamaOptions {
        OllamaOptions {
            ollama_host: "127.0.0.1:11435".to_string(),
            ollama_num_parallel: "2".to_string(),
            ollama_max_loaded_models: "2".to_string(),
            ollama_origins: "*".to_string(),
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
        let start_time = std::time::Instant::now();
        let mut success = false;
        let ollama_api = OllamaApiClient::new(self.get_ollama_api_base_url());
        while std::time::Instant::now().duration_since(start_time)
            < std::time::Duration::from_millis(Self::HEALTH_TIMEOUT_MS)
        {
            let status = ollama_api.health().await;
            if status.is_ok() && status.unwrap() {
                success = true;
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
        if !success {
            return Err("wait ollama server timeout".to_string());
        }
        Ok(())
    }

    pub async fn spawn(&self, ensure_model: Option<&str>) -> Result<(), String> {
        let env = options_to_env(&self.options);
        self.process_handler.spawn(env, ["serve"].to_vec()).await?;
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

    pub fn kill_llama_process() {
        kill_process_by_name("ollama_llama_server");
    }
    pub async fn kill(&self) {
        Self::kill_llama_process();
        self.process_handler.kill().await;
    }
}
