use std::{
    fs,
    path::{Path, PathBuf},
    time::Duration,
};

use opener::open;
use regex::Regex;
use tauri::AppHandle;
use tokio::sync::mpsc::Sender;

use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;

use super::{
    process_handler::{ProcessHandler, ProcessHandlerEvent},
    process_utils::{kill_existing_processes_using_ports, options_to_env},
};

pub struct ShinkaiNodeProcessHandler {
    app: AppHandle,
    process_handler: ProcessHandler,
    app_resource_dir: PathBuf,
    app_data_dir: PathBuf,
    options: ShinkaiNodeOptions,
}

impl ShinkaiNodeProcessHandler {
    const HEALTH_REQUEST_TIMEOUT_MS: u64 = 250;
    const HEALTH_TIMEOUT_MS: u64 = 10000;
    const PROCESS_NAME: &'static str = "shinkai-node";

    pub fn new(
        app: AppHandle,
        event_sender: Sender<ProcessHandlerEvent>,
        app_resource_dir: PathBuf,
        app_data_dir: PathBuf,
    ) -> Self {
        let options =
            ShinkaiNodeOptions::with_app_options(app_resource_dir.clone(), app_data_dir.clone());

        let node_api_ip = options.clone().node_api_ip.unwrap_or_default();
        let node_api_port = options.clone().node_api_port.unwrap_or_default();
        let ready_matcher =
            Regex::new(format!("listening on http://{}:{}", node_api_ip, node_api_port).as_str())
                .unwrap();
        let process_handler = ProcessHandler::new(
            app.clone(),
            Self::PROCESS_NAME.to_string(),
            event_sender,
            ready_matcher,
        );

        ShinkaiNodeProcessHandler {
            app,
            process_handler,
            app_resource_dir,
            app_data_dir,
            options,
        }
    }

    fn get_base_url(&self) -> String {
        let ip = self.options.clone().node_api_ip.unwrap();
        let port = self.options.clone().node_api_port.unwrap();
        let base_url = format!("http://{}:{}", ip, port);
        base_url
    }

    async fn health(base_url: &str, timeout: Duration) -> bool {
        let url = format!("{}/v2/health_check", base_url);
        let client = reqwest::Client::new();
        log::info!(
            "checking shinkai-nodehealth of {} with timeout {:?}",
            url,
            timeout
        );
        match client.get(&url).timeout(timeout).send().await {
            Ok(response) => {
                let status = response.status();
                let text = response.text().await;
                log::info!("health check response: {:?} {:?}", status, text);
                status == reqwest::StatusCode::OK
            }
            Err(e) => {
                log::info!("health check failed {:?}", e);
                false
            }
        }
    }

    async fn wait_shinkai_node_server(&self) -> Result<(), String> {
        let max_wait_time = Duration::from_millis(Self::HEALTH_TIMEOUT_MS);
        let default_timeout = Duration::from_millis(Self::HEALTH_REQUEST_TIMEOUT_MS);
        let mut timeout = default_timeout;
        let mut retries = 0;
        let start_time = std::time::Instant::now();
        let base_url = self.get_base_url();
        tokio::select! {
            _ = tokio::time::sleep(max_wait_time) => {
                let elapsed = start_time.elapsed();
                Err(format!("wait shinkai-node server timeout after {}ms", elapsed.as_millis()))
            }
            _ = tokio::spawn(async move {
                loop {
                    match Self::health(base_url.as_str(), timeout).await {
                        true => break,
                        false => {
                            retries = retries + 1;
                            log::info!("health check failed, retrying in {:?}ms", timeout);
                            let retry_add = default_timeout * retries;
                            timeout = timeout.checked_add(retry_add).unwrap_or(max_wait_time);
                            log::info!("new timeout is: {:?}", timeout);
                            tokio::time::sleep(Duration::from_millis(50)).await
                        }
                    }
                }
            }) => {
                Ok(())
            }
        }
    }

    pub fn set_options(&mut self, options: ShinkaiNodeOptions) -> ShinkaiNodeOptions {
        self.options = ShinkaiNodeOptions::from_merge(self.options.clone(), options);
        self.options.clone()
    }

    pub async fn remove_storage(&self, preserve_keys: bool) -> Result<(), String> {
        if self.process_handler.is_running().await {
            return Err("can't remove node storage while it's running".to_string());
        }
        let options = self.options.clone();
        let storage_path = options.node_storage_path.unwrap();
        for entry in fs::read_dir(storage_path)
            .map_err(|e| format!("Failed to read storage directory: {}", e))?
        {
            let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
            let path = entry.path();
            if path.is_dir() {
                fs::remove_dir_all(path)
                    .map_err(|e| format!("Failed to remove directory: {}", e))?;
            } else {
                if preserve_keys && path.ends_with(".secret") {
                    // Delete the line starting with 'GLOBAL_IDENTITY_NAME=' in .secret file
                    if path.file_name().unwrap() == ".secret" {
                        let content = fs::read_to_string(&path)
                            .map_err(|e| format!("Failed to read .secret file: {}", e))?;
                        let new_content: String = content
                            .lines()
                            .filter(|line| !line.starts_with("GLOBAL_IDENTITY_NAME="))
                            .collect::<Vec<&str>>()
                            .join("\n");
                        fs::write(&path, new_content)
                            .map_err(|e| format!("Failed to write updated .secret file: {}", e))?;
                    }
                    continue;
                }
                fs::remove_file(path).map_err(|e| format!("Failed to remove file: {}", e))?;
            }
        }
        Ok(())
    }

    pub async fn spawn(&self) -> Result<(), String> {
        let _ = self.kill().await;

        let env = options_to_env(&self.options.clone());
        self.process_handler.spawn(env, [].to_vec(), None).await?;
        if let Err(e) = self.wait_shinkai_node_server().await {
            self.process_handler.kill().await;
            return Err(e);
        }
        Ok(())
    }

    pub fn set_default_options(&mut self) -> ShinkaiNodeOptions {
        self.options = ShinkaiNodeOptions::with_app_options(
            self.app_resource_dir.clone(),
            self.app_data_dir.clone(),
        );
        self.options.clone()
    }

    pub fn get_options(&self) -> ShinkaiNodeOptions {
        self.options.clone()
    }

    pub async fn is_running(&self) -> bool {
        self.process_handler.is_running().await
    }

    pub async fn kill_existing_processes_using_ports(&self) -> Result<(), String> {
        // Extract ports from options
        let ports: Vec<&str> = vec![
            self.options.node_port.as_deref(),
            self.options.node_ws_port.as_deref(),
            self.options.node_api_port.as_deref(),
        ]
        .into_iter()
        .flatten()
        .collect();

        let _ = kill_existing_processes_using_ports(self.app.clone(), ports).await;
        Ok(())
    }

    pub async fn kill(&self) {
        self.process_handler.kill().await;
        let _ = self.kill_existing_processes_using_ports().await;
    }

    pub fn open_storage_location(&self) -> Result<(), String> {
        let options = self.options.clone();
        let storage_path: PathBuf = options
            .node_storage_path
            .ok_or_else(|| "Storage path not set".to_string())?
            .into();

        opener::open(&storage_path).map_err(|e| format!("Failed to open storage location: {}", e))
    }

    pub fn open_storage_location_with_path(&self, relative_path: &str) -> Result<(), String> {
        let options = self.options.clone();
        let storage_path: PathBuf = options
            .node_storage_path
            .ok_or_else(|| "Storage path not set".to_string())?
            .into();

        // Sanitize the relative path to prevent directory traversal
        let safe_path = relative_path
            .split(['/', '\\']) // Handle both Unix and Windows path separators
            .filter(|component| !component.is_empty() && component != &"." && component != &"..");

        // Build the target path by joining components
        let target_path = safe_path.fold(storage_path.clone(), |acc: PathBuf, component| {
            acc.join(component)
        });

        // Verify the target path is within storage_path
        if !target_path.starts_with(&storage_path) {
            return Err("Invalid path: attempting to access outside storage directory".to_string());
        }

        // Check if path exists
        if !target_path.exists() {
            return Err(format!("Path does not exist: {}", target_path.display()));
        }

        opener::open(&target_path).map_err(|e| format!("Failed to open location: {}", e))
    }

    pub fn open_chat_folder(
        &self,
        storage_location: &str,
        chat_folder_name: &str,
    ) -> Result<(), String> {
        let storage_path = Path::new(storage_location);
        let filesystem_path = Path::new("filesystem");
        let chat_path = Path::new(chat_folder_name);
        let full_path = storage_path.join(filesystem_path).join(chat_path);

        let full_path_str = match full_path.to_str() {
            Some(s) => s.to_string(), // Convert to owned String
            None => return Err("Invalid path".to_string()),
        };

        match open(full_path_str) {
            Ok(_) => Ok(()),
            Err(e) => Err(format!("Failed to open folder: {}", e)),
        }
    }
}
