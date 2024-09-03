use std::{fs, time::Duration};

use regex::Regex;
use tokio::sync::mpsc::Sender;

use crate::{app::APP_HANDLE, local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions};

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
    const HEALTH_REQUEST_TIMEOUT_MS: u64 = 250;
    const HEALTH_TIMEOUT_MS: u64 = 5000;
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

    async fn health(base_url: &str, timeout_ms: u64) -> Result<bool, ()> {
        let url = format!("{}/v1/shinkai_health", base_url);
        let client = reqwest::Client::new();
        if let Ok(response) = client
            .get(&url)
            .timeout(std::time::Duration::from_millis(timeout_ms))
            .send()
            .await
        {
            Ok(response.status() == reqwest::StatusCode::OK)
        } else {
            Ok(false)
        }
    }

    async fn wait_shinkai_node_server(&self) -> Result<(), String> {
        let timeout = Duration::from_millis(Self::HEALTH_TIMEOUT_MS);
        let start_time = std::time::Instant::now();
        let base_url = self.get_base_url();
        tokio::select! {
            _ = tokio::time::sleep(timeout) => {
                let elapsed = start_time.elapsed();
                Err(format!("wait shinkai-node server timeout after {}ms", elapsed.as_millis()))
            }
            _ = tokio::spawn(async move {
                loop {
                    match Self::health(base_url.as_str(), Self::HEALTH_REQUEST_TIMEOUT_MS).await {
                        Ok(true) => break,
                        Ok(false) | Err(_) => tokio::time::sleep(Duration::from_millis(50)).await
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
        let shinkai_tools_backend_binary_path = if cfg!(target_os = "windows") {
            std::env::current_exe()
                .unwrap()
                .parent()
                .unwrap()
                .join("shinkai-tools-backend.exe")
                .to_string_lossy()
                .to_string()
        } else {
            std::env::current_exe()
                .unwrap()
                .parent()
                .unwrap()
                .join("shinkai-tools-backend")
                .to_string_lossy()
                .to_string()
        };

        let resource_dir = APP_HANDLE
            .get()
            .unwrap()
            .lock()
            .await
            .path_resolver()
            .resource_dir();

        let pdfium_path = if cfg!(target_os = "macos") {
            Some(
                resource_dir
                    .clone()
                    .map(|dir| {
                        dir.join("../Frameworks/libpdfium.dylib")
                            .to_string_lossy()
                            .to_string()
                    })
                    .unwrap_or_default(),
            )
        } else if cfg!(target_os = "windows") {
            Some(
                resource_dir
                    .clone()
                    .map(|dir| {
                        dir.join("external-binaries/shinkai-node/pdfium.dll")
                            .to_string_lossy()
                            .to_string()
                    })
                    .unwrap_or_default(),
            )
        } else {
            Some(
                resource_dir
                    .clone()
                    .map(|dir| {
                        dir.join("external-binaries/shinkai-node/libpdfium.so")
                            .to_string_lossy()
                            .to_string()
                    })
                    .unwrap_or_default(),
            )
        };
        let options = ShinkaiNodeOptions {
            shinkai_tools_backend_binary_path: Some(shinkai_tools_backend_binary_path),
            pdfium_dynamic_lib_path: pdfium_path,
            ..self.options.clone()
        };
        let env = options_to_env(&options);
        self.process_handler.spawn(env, [].to_vec(), None).await?;
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
