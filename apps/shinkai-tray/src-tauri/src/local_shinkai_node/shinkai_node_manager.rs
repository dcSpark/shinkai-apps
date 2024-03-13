use serde::Serialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::api::process::{Command, CommandChild, CommandEvent};

/// It should match ENV variables names from ShinkaiNode
#[derive(Serialize, Clone)]
pub struct ShinkaiNodeOptions {
    port: Option<u32>,
    unstructured_server_url: Option<String>,
    embeddings_server_url: Option<String>,
    first_device_needs_registration_code: Option<String>,
    initial_agent_names: Option<String>,
    initial_agent_urls: Option<String>,
    initial_agent_models: Option<String>,
    initial_agent_api_keys: Option<String>,
}

pub struct ShinkaiNodeManager {
    process: Arc<Mutex<Option<CommandChild>>>,
    options: ShinkaiNodeOptions,
    logs: Arc<Mutex<Vec<String>>>,
}

impl ShinkaiNodeManager {
    const MAX_LOGS_LENGTH: usize = 500;
    /// Initializes a new ShinkaiNodeManager with default or provided options
    pub(crate) fn new(options: Option<ShinkaiNodeOptions>) -> Self {
        let default_options = Self::default_options();
        let merged_options = match options {
            Some(opts) => ShinkaiNodeOptions {
                port: Some(opts.port.unwrap_or_else(|| default_options.port.unwrap())),
                unstructured_server_url: Some(opts.unstructured_server_url.unwrap_or_else(|| default_options.unstructured_server_url.unwrap())),
                embeddings_server_url: Some(opts.embeddings_server_url.unwrap_or_else(|| default_options.embeddings_server_url.unwrap())),
                first_device_needs_registration_code: Some(opts.first_device_needs_registration_code.unwrap_or_else(|| default_options.first_device_needs_registration_code.unwrap())),
                initial_agent_names: Some(opts.initial_agent_names.unwrap_or_else(|| default_options.initial_agent_names.unwrap())),
                initial_agent_urls: Some(opts.initial_agent_urls.unwrap_or_else(|| default_options.initial_agent_urls.unwrap())),
                initial_agent_models: Some(opts.initial_agent_models.unwrap_or_else(|| default_options.initial_agent_models.unwrap())),
                initial_agent_api_keys: Some(opts.initial_agent_api_keys.unwrap_or_else(|| default_options.initial_agent_api_keys.unwrap())),
            },
            None => default_options,
        };
        ShinkaiNodeManager {
            process: Arc::new(Mutex::new(None)),
            options: merged_options,
            logs: Arc::new(Mutex::new(vec![String::new(); Self::MAX_LOGS_LENGTH])),
        }
    }

    fn default_options() -> ShinkaiNodeOptions {
        ShinkaiNodeOptions {
            port: Some(9550),
            unstructured_server_url: Some("https://public.shinkai.com/x-un".to_string()),
            embeddings_server_url: Some("https://public.shinkai.com/x-em".to_string()),
            first_device_needs_registration_code: Some("false".to_string()),
            initial_agent_names: Some("ollama_mixtral".to_string()),
            initial_agent_urls: Some("http://localhost:11434".to_string()),
            initial_agent_models: Some("ollama:mixtral".to_string()),
            initial_agent_api_keys: Some("".to_string()),
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

    fn add_log(&self, log_entry: String) {
        let mut logs = self.logs.lock().unwrap();
        if logs.len() == ShinkaiNodeManager::MAX_LOGS_LENGTH {
            logs.remove(0); // Remove the oldest log entry to make space
        }
        logs.push(log_entry.clone()); // Add the new log entry
        println!("{:?}", log_entry);
    }

    /// Retrieves the last `n` logs.
    /// If `n` is greater than the available logs, it returns all logs.
    pub fn get_last_n_logs(&self, n: usize) -> Vec<String> {
        let logs = self.logs.lock().unwrap();
        let parsed_logs: Vec<String>;
        if n >= logs.len() {
            parsed_logs = logs.clone();
        } else {
            parsed_logs = logs.as_slice()[logs.len() - n..].to_vec();
        }
        parsed_logs
            .into_iter()
            .filter(|value| !value.is_empty())
            .collect()
    }

    pub fn get_options(&self) -> ShinkaiNodeOptions {
        self.options.clone()
    }

    /// Checks if the shinkai node process is running.
    pub fn is_running(&self) -> bool {
        let process = self.process.lock().unwrap();
        process.is_some()
    }

    /// Spawns the shinkai-node process
    pub fn spawn_shinkai_node(&self) -> Result<(), String> {
        let mut process = self.process.lock().map_err(|e| e.to_string())?;
        if process.is_none() {
            let env = Self::options_to_env(&self.options);
            let (mut rx, mut child) = Command::new_sidecar("shinkai-node-v0.5.3")
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

            // let self_clone = self.clone();
            let logs_mutex = Arc::clone(&self.logs);
            let process_mutex = Arc::clone(&self.process);

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
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
                            let mut process = process_mutex.lock().unwrap();
                            *process = None;
                        }
                        _ => todo!(),
                    }
                    if (!line.is_empty()) {
                        let mut logs = logs_mutex.lock().unwrap();
                        if logs.len() == ShinkaiNodeManager::MAX_LOGS_LENGTH {
                            logs.remove(0); // Remove the oldest log entry to make space
                        }
                        logs.push(line.clone()); // Add the new log entry
                        println!("{:?}", line);
                    }
                }
            });
            *process = Some(child);
            println!("shinkai-node process spawned");
        } else {
            println!("shinkai-node process is already running");
        }
        Ok(())
    }

    /// Kill the spawned shinkai-node process
    pub fn kill_shinkai_node(&self) {
        let mut process = self.process.lock().unwrap();
        if let Some(child) = process.take() {
            match child.kill() {
                Ok(_) => println!("shinkai-node process killed"),
                Err(e) => println!("shinkai-node to kill sidecar process: {}", e),
            }
            *process = None;
        } else {
            println!("No shinkai-node process is running");
        }
    }
}
