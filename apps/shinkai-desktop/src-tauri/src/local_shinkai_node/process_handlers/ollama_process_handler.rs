use futures_util::StreamExt;
use serde::Serialize;
use tokio::sync::mpsc::Sender;

use crate::local_shinkai_node::ollama_api::ollama_api_client::OllamaApiClient;

use super::{
    logger::LogEntry, process_handler::{ProcessHandler, ProcessHandlerEvent}, process_utils::options_to_env
};

#[derive(Serialize)]
pub struct OllamaOptions {
    pub ollama_host: String,
}

pub struct OllamaProcessHandler {
    process_handler: ProcessHandler,
    options: OllamaOptions,
}

impl OllamaProcessHandler {
    const HEALTH_TIMEOUT_MS: u64 = 500;
    const PROCESS_NAME: &'static str = "ollama-v0.1.33";
    pub fn new(options: OllamaOptions, event_sender: Sender<ProcessHandlerEvent>) -> Self {
        let process_handler = ProcessHandler::new(Self::PROCESS_NAME.to_string(), event_sender);
        OllamaProcessHandler {
            process_handler,
            options,
        }
    }

    fn get_ollama_api_base_url(&self) -> String {
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
            match ollama_api.pull_stream(model).await {
                Ok(mut stream) => {
                    while let Some(stream_value) = stream.next().await {
                        println!("{:?}", stream_value);
                    }
                }
                Err(e) => {
                    self.process_handler.kill().await;
                    return Err(e.to_string());
                }
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

    pub async fn kill(&self) {
        self.process_handler.kill().await;
    }
}
