use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;
use std::sync::Arc;
use tokio::sync::Mutex;

use super::process_handlers::ollama_process_handler::{OllamaOptions, OllamaProcessHandler};
use super::process_handlers::process_handler::LogEntry;
use super::process_handlers::shinkai_node_process_handler::ShinkaiNodeProcessHandler;
use tokio::sync::mpsc::channel;

pub struct ShinkaiNodeManager {
    ollama_process: Arc<Mutex<OllamaProcessHandler>>,
    shinkai_node_process: Arc<Mutex<ShinkaiNodeProcessHandler>>,
    // ollama_process_event_handler: Arc<Mutex<Option<ShinkaiNodeProcessHandler>>>,
    // shinkai_node_process_event_handler: Arc<Mutex<Option<ShinkaiNodeProcessHandler>>>,
}

impl ShinkaiNodeManager {
    /// Initializes a new ShinkaiNodeManager with default or provided options
    pub(crate) fn new() -> Self {
        let (ollama_sender, ollama_receiver) = channel(100);
        let (shinkai_node_sender, shinkai_node_receiver) = channel(100);

        ShinkaiNodeManager {
            ollama_process: Arc::new(Mutex::new(OllamaProcessHandler::new(
                OllamaOptions {
                    ollama_host: "127.0.0.1:11435".to_string(),
                },
                ollama_sender,
            ))),
            shinkai_node_process: Arc::new(Mutex::new(ShinkaiNodeProcessHandler::new(
                shinkai_node_sender,
            ))),
        }
    }

    pub async fn get_last_n_shinkai_node_logs(&self, n: usize) -> Vec<LogEntry> {
        let shinkai_node_guard = self.shinkai_node_process.lock().await;
        let ollama_guard = self.ollama_process.lock().await;
        let shinkai_logs = shinkai_node_guard.get_last_n_logs(n).await;
        let ollama_logs = ollama_guard.get_last_n_logs(n).await;

        let mut merged_logs = shinkai_logs;
        merged_logs.extend(ollama_logs.into_iter());
        merged_logs.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
        merged_logs
    }

    pub async fn get_shinkai_node_options(&self) -> ShinkaiNodeOptions {
        let shinkai_node_process_guard = self.shinkai_node_process.lock().await;
        let options = shinkai_node_process_guard.get_options();
        options.clone()
    }

    pub async fn is_running(&self) -> bool {
        let shinkai_node_guard = self.shinkai_node_process.lock().await;
        let ollama_guard = self.ollama_process.lock().await;
        shinkai_node_guard.is_running().await && ollama_guard.is_running().await
    }

    pub async fn spawn(&self) -> Result<(), String> {
        let shinkai_node_guard = self.shinkai_node_process.lock().await;
        let ollama_guard = self.ollama_process.lock().await;
        shinkai_node_guard.spawn().await?;
        if let Err(e) = ollama_guard.spawn(Some("llama3:8b-instruct-q4_K_M")).await {
            shinkai_node_guard.kill().await;
            return Err(e);
        }
        Ok(())
    }

    pub async fn kill(&self) {
        let shinkai_node_guard = self.shinkai_node_process.lock().await;
        let ollama_guard = self.ollama_process.lock().await;
        shinkai_node_guard.kill().await;
        ollama_guard.kill().await;
    }

    pub async fn remove_storage(&self) -> Result<(), String> {
        let guard = self.shinkai_node_process.lock().await;
        guard.remove_storage().await
    }

    pub async fn set_default_shinkai_node_options(&mut self) -> ShinkaiNodeOptions {
        let mut guard = self.shinkai_node_process.lock().await;
        guard.set_default_options()
    }

    pub async fn set_shinkai_node_options(
        &mut self,
        options: ShinkaiNodeOptions,
    ) -> ShinkaiNodeOptions {
        let mut guard = self.shinkai_node_process.lock().await;
        guard.set_options(options)
    }
}
