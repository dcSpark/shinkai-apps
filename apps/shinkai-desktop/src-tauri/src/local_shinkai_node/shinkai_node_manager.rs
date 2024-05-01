use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;
use std::fs;
use std::{collections::HashMap, sync::Arc};
use tauri::api::process::{Command, CommandChild, CommandEvent};
use tokio::sync::Mutex;

pub struct ShinkaiNodeManager {
    process: Arc<Mutex<Option<CommandChild>>>,
    options: ShinkaiNodeOptions,
    logs: Arc<Mutex<Vec<String>>>,
}

impl ShinkaiNodeManager {
    const MAX_LOGS_LENGTH: usize = 500;
    const HEALTH_TIMEOUT_MS: u64 = 5000;
    const MIN_MS_ALIVE: u64 = 3000;

    /// Initializes a new ShinkaiNodeManager with default or provided options
    pub(crate) fn new() -> Self {
        let default_options = Self::default_options();
        ShinkaiNodeManager {
            process: Arc::new(Mutex::new(None)),
            options: default_options,
            logs: Arc::new(Mutex::new(vec![String::new(); Self::MAX_LOGS_LENGTH])),
        }
    }

    fn default_options() -> ShinkaiNodeOptions {
        ShinkaiNodeOptions {
            port: Some("9550".to_string()),
            node_storage_path: Some("node_storage".to_string()),
            unstructured_server_url: Some("https://public.shinkai.com/x-un".to_string()),
            embeddings_server_url: Some("https://public.shinkai.com/x-em".to_string()),
            first_device_needs_registration_code: Some("false".to_string()),
            initial_agent_names: Some("FREE_TEXT_INFERENCE".to_string()),
            initial_agent_urls: Some("https://backend-hosting.shinkai.com".to_string()),
            initial_agent_models: Some("shinkai-backend:FREE_TEXT_INFERENCE".to_string()),
            initial_agent_api_keys: Some("".to_string()),
            starting_num_qr_devices: Some("0".to_string()),
        }
    }

    /// Converts ShinkaiNodeOptions to a HashMap for environment variables.
    fn options_to_env(options: &ShinkaiNodeOptions) -> HashMap<String, String> {
        let mut env = HashMap::new();
        let options_reflection = serde_json::to_value(options).unwrap();
        for (key, value) in options_reflection.as_object().unwrap() {
            let env_key = key.to_uppercase();
            let env_value = value.as_str().unwrap_or_default().to_string();
            env.insert(env_key, env_value);
        }
        env
    }

    async fn add_log(&self, log_entry: String) {
        let mut logs = self.logs.lock().await;
        if logs.len() == ShinkaiNodeManager::MAX_LOGS_LENGTH {
            logs.remove(0); // Remove the oldest log entry to make space
        }
        logs.push(log_entry.clone()); // Add the new log entry
        println!("{:?}", log_entry);
    }

    async fn check_node_healthcheck(&self) -> Result<(), String> {
        let node_address = format!(
            "http://localhost:{}/v1/shinkai_health",
            self.options.port.clone().unwrap()
        );
        let client = reqwest::Client::new();
        let start_time = std::time::Instant::now();
        let mut success = false;
        while std::time::Instant::now().duration_since(start_time)
            < std::time::Duration::from_millis(Self::HEALTH_TIMEOUT_MS)
        {
            if let Ok(response) = client
                .get(&node_address)
                .timeout(std::time::Duration::from_millis(400))
                .send()
                .await
            {
                println!("checking node health {}", response.status());
                if response.status() == reqwest::StatusCode::OK {
                    success = true;
                    break;
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
        if !success {
            return Err("shinkai-node spawn failed".to_string());
        }
        Ok(())
    }

    async fn command_event_to_logs(logs_mutex: Arc<Mutex<Vec<String>>>, event: CommandEvent) {
        let mut line: String = "".to_string();
        match event {
            CommandEvent::Stdout(message) => {
                line = message;
            }
            CommandEvent::Stderr(message) => {
                line = message;
            }
            CommandEvent::Error(message) => {
                line = message;
            }
            CommandEvent::Terminated(payload) => {
                line = format!(
                    "Shinkai Node process terminated with code:{:?} and signal:{:?}",
                    payload.code, payload.signal
                );
            }
            _ => {}
        }
        if !line.is_empty() {
            let mut logs = logs_mutex.lock().await;
            if logs.len() == Self::MAX_LOGS_LENGTH {
                logs.remove(0);
            }
            logs.push(line.clone());
            println!("{:?}", line);
        }
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

    /// Retrieves the last `n` logs.
    /// If `n` is greater than the available logs, it returns all logs.
    pub async fn get_last_n_logs(&self, n: usize) -> Vec<String> {
        let logs = self.logs.lock().await;
        let parsed_logs: Vec<String> = if n >= logs.len() {
            logs.clone()
        } else {
            logs.as_slice()[logs.len() - n..].to_vec()
        };
        parsed_logs
            .into_iter()
            .filter(|value| !value.is_empty())
            .collect()
    }

    pub fn get_options(&self) -> ShinkaiNodeOptions {
        self.options.clone()
    }

    /// Checks if the shinkai node process is running.
    pub async fn is_running(&self) -> bool {
        let process = self.process.lock().await;
        process.is_some()
    }

    /// Spawns the shinkai-node process
    pub async fn spawn_shinkai_node(&self) -> Result<(), String> {
        let mut process = self.process.lock().await;
        if process.is_some() {
            println!("shinkai-node process is already running");
            return Ok(());
        }
        let env = Self::options_to_env(&self.options);
        let (mut rx, child) = Command::new_sidecar("shinkai-node-v0.6.4")
            .map_err(|error| {
                let log = format!(
                    "failed to spawn shinkai-node error: {:?}",
                    error.to_string()
                );
                self.add_log(log.clone());
                log
            })?
            .envs(env)
            .spawn()
            .map_err(|error| {
                let log = format!(
                    "failed to spawn shinkai-node error: {:?}",
                    error.to_string()
                );
                self.add_log(log.clone());
                log
            })?;
        let logs_mutex = Arc::clone(&self.logs);
        let start_time = std::time::Instant::now();
        while std::time::Instant::now().duration_since(start_time)
            < std::time::Duration::from_millis(Self::MIN_MS_ALIVE)
        {
            if let Ok(event) = rx.try_recv() {
                Self::command_event_to_logs(logs_mutex.clone(), event.clone()).await;
                if matches!(event, CommandEvent::Terminated { .. }) {
                    println!("failed to spawn shinkai-node, it crashed before min time alive");
                    return Err(
                        "failed to spawn shinkai-node, it crashed before min time alive"
                            .to_string(),
                    );
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }

        if let Err(e) = self.check_node_healthcheck().await {
            let _ = child.kill();
            return Err(e);
        }

        *process = Some(child);

        let process_mutex = Arc::clone(&self.process);
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                Self::command_event_to_logs(logs_mutex.clone(), event.clone()).await;
                if matches!(event, CommandEvent::Terminated { .. }) {
                    let mut process = process_mutex.lock().await;
                    *process = None;
                }
            }
        });
        Ok(())
    }

    /// Kill the spawned shinkai-node process
    pub async fn kill_shinkai_node(&self) {
        let mut process = self.process.lock().await;
        if let Some(child) = process.take() {
            match child.kill() {
                Ok(_) => println!("shinkai-node process killed"),
                Err(e) => println!("shinkai-node to kill sidecar process: {}", e),
            }
            *process = None;
        } else {
            println!("no shinkai-node process is running");
        }
    }

    pub async fn remove_storage(&self) -> Result<(), String> {
        if self.is_running().await {
            return Err("can't remove node storage while it's running".to_string());
        }
        let options = self.options.clone();
        match fs::remove_dir_all(options.node_storage_path.unwrap()) {
            Ok(_) => Ok(()),
            Err(message) => Err(format!(
                "failed to remove Shinkai Node storage error:{:?}",
                message
            )),
        }
    }

    pub fn set_default_options(&mut self) -> ShinkaiNodeOptions {
        self.options = Self::default_options();
        self.options.clone()
    }
}
