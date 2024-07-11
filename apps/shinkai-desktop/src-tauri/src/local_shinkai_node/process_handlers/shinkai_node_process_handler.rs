use std::fs;

use regex::Regex;
use tokio::sync::mpsc::Sender;

use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;

use super::{
    logger::LogEntry,
    process_handler::{ProcessHandler, ProcessHandlerEvent},
    process_utils::options_to_env,
};

pub struct ShinkaiNodeProcessHandler {
    default_node_storage_path: String,
    process_handler: ProcessHandler,
    options: ShinkaiNodeOptions,
}

impl ShinkaiNodeProcessHandler {
    const HEALTH_TIMEOUT_MS: u64 = 500;
    const PROCESS_NAME: &'static str = "shinkai-node";
    const READY_MATCHER: &'static str = "listening on ";

    pub fn new(
        event_sender: Sender<ProcessHandlerEvent>,
        default_node_storage_path: String,
    ) -> Self {
        let ready_matcher = Regex::new(Self::READY_MATCHER).unwrap();
        let options = ShinkaiNodeOptions::with_storage_path(default_node_storage_path.clone());
        let process_handler =
            ProcessHandler::new(Self::PROCESS_NAME.to_string(), event_sender, ready_matcher);
        ShinkaiNodeProcessHandler {
            default_node_storage_path: default_node_storage_path.clone(),
            process_handler,
            options,
        }
    }

    fn get_base_url(&self) -> String {
        let ip = self.options.clone().node_api_ip.unwrap();
        let port = self.options.clone().node_api_port.unwrap();
        let base_url = format!("http://{}:{}", ip, port);
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
        self.options = ShinkaiNodeOptions::from_merge(self.options.clone(), options);
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
        self.options =
            ShinkaiNodeOptions::with_storage_path(self.default_node_storage_path.clone());
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
