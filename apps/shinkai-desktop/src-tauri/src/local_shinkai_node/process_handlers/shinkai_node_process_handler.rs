use std::fs;

use regex::Regex;
use tokio::sync::mpsc::Sender;

use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;

use super::{
    logger::LogEntry, process_handler::{ProcessHandler, ProcessHandlerEvent}, process_utils::options_to_env
};

pub struct ShinkaiNodeProcessHandler {
    process_handler: ProcessHandler,
    options: ShinkaiNodeOptions,
}

impl ShinkaiNodeProcessHandler {
    const HEALTH_TIMEOUT_MS: u64 = 500;
    const PROCESS_NAME: &'static str = "shinkai-node-v0.6.5";
    const READY_MATCHER: &'static str = "listening on ";

    pub fn new(event_sender: Sender<ProcessHandlerEvent>) -> Self {
        let ready_matcher = Regex::new(Self::READY_MATCHER).unwrap();
        let options = Self::default_options();
        let process_handler = ProcessHandler::new(Self::PROCESS_NAME.to_string(), event_sender, ready_matcher);
        ShinkaiNodeProcessHandler {
            process_handler,
            options,
        }
    }

    fn default_options() -> ShinkaiNodeOptions {
        ShinkaiNodeOptions {
            port: Some("9550".to_string()),
            node_storage_path: Some("node_storage".to_string()),
            unstructured_server_url: Some("https://public.shinkai.com/x-un".to_string()),
            embeddings_server_url: Some("https://public.shinkai.com/x-em".to_string()),
            first_device_needs_registration_code: Some("false".to_string()),
            initial_agent_names: Some("OLLAMA_LLAMA_3".to_string()),
            initial_agent_urls: Some("http://127.0.0.1:11435".to_string()),
            initial_agent_models: Some("ollama:llama3:8b-instruct-q4_K_M".to_string()),
            initial_agent_api_keys: Some("".to_string()),
            starting_num_qr_devices: Some("0".to_string()),
        }
    }

    fn get_base_url(&self) -> String {
        let port = self.options.clone().port.unwrap();
        let base_url = format!("http://127.0.0.1:{}", port);
        base_url
    }

    async fn health(&self) -> Result<bool, ()> {
        let url = format!("{}/v1/shinkai_health", self.get_base_url());
        let client = reqwest::Client::new();
        if let Ok(response) = client
            .get(&url)
            .timeout(std::time::Duration::from_millis(400))
            .send()
            .await
        {
            Ok(response.status() == reqwest::StatusCode::OK)
        } else {
            Ok(false)
        }
    }

    async fn wait_shinkai_node_server(&self) -> Result<(), String> {
        let start_time = std::time::Instant::now();
        let mut success = false;
        while std::time::Instant::now().duration_since(start_time)
            < std::time::Duration::from_millis(Self::HEALTH_TIMEOUT_MS)
        {
            let status = self.health().await.unwrap();
            if status {
                success = true;
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
        if !success {
            return Err("wait shinkai-node server timeout".to_string());
        }
        Ok(())
    }

    pub fn set_options(&mut self, options: ShinkaiNodeOptions) -> ShinkaiNodeOptions {
        let base_options = self.options.clone();
        let merged_options = ShinkaiNodeOptions {
            port: Some(options.port.unwrap_or_else(|| base_options.port.unwrap())),
            node_storage_path: Some(
                options
                    .node_storage_path
                    .unwrap_or_else(|| base_options.node_storage_path.unwrap()),
            ),
            unstructured_server_url: Some(
                options
                    .unstructured_server_url
                    .unwrap_or_else(|| base_options.unstructured_server_url.unwrap()),
            ),
            embeddings_server_url: Some(
                options
                    .embeddings_server_url
                    .unwrap_or_else(|| base_options.embeddings_server_url.unwrap()),
            ),
            first_device_needs_registration_code: Some(
                options
                    .first_device_needs_registration_code
                    .unwrap_or_else(|| base_options.first_device_needs_registration_code.unwrap()),
            ),
            initial_agent_names: Some(
                options
                    .initial_agent_names
                    .unwrap_or_else(|| base_options.initial_agent_names.unwrap()),
            ),
            initial_agent_urls: Some(
                options
                    .initial_agent_urls
                    .unwrap_or_else(|| base_options.initial_agent_urls.unwrap()),
            ),
            initial_agent_models: Some(
                options
                    .initial_agent_models
                    .unwrap_or_else(|| base_options.initial_agent_models.unwrap()),
            ),
            initial_agent_api_keys: Some(
                options
                    .initial_agent_api_keys
                    .unwrap_or_else(|| base_options.initial_agent_api_keys.unwrap()),
            ),
            starting_num_qr_devices: Some(
                options
                    .starting_num_qr_devices
                    .unwrap_or_else(|| base_options.starting_num_qr_devices.unwrap()),
            ),
        };
        self.options = merged_options;
        self.options.clone()
    }

    pub async fn remove_storage(&self) -> Result<(), String> {
        if self.process_handler.is_running().await {
            return Err("can't remove node storage while it's running".to_string());
        }
        let options = self.options.clone();
        match fs::remove_dir_all(options.node_storage_path.unwrap()) {
            Ok(_) => Ok(()),
            Err(message) => Err(format!(
                "failed to remove Shinkai Node storage error:{}",
                message
            )),
        }
    }

    pub async fn spawn(&self) -> Result<(), String> {
        let env = options_to_env(&self.options);
        self.process_handler.spawn(env, [].to_vec()).await?;
        if let Err(e) = self.wait_shinkai_node_server().await {
            self.process_handler.kill().await;
            return Err(e);
        }
        Ok(())
    }

    pub async fn get_last_n_logs(&self, n: usize) -> Vec<LogEntry> {
        self.process_handler.get_last_n_logs(n).await
    }

    pub fn set_default_options(&mut self) -> ShinkaiNodeOptions {
        self.options = Self::default_options();
        self.options.clone()
    }

    pub fn get_options(&self) -> ShinkaiNodeOptions {
        self.options.clone()
    }

    pub async fn is_running(&self) -> bool {
        self.process_handler.is_running().await
    }

    pub async fn kill(&self) {
        self.process_handler.kill().await;
    }
}
