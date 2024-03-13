use serde::Serialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::api::process::{Command, CommandChild, CommandEvent};

/// It should match ENV variables names from ShinkaiNode
#[derive(Serialize)]
pub struct ShinkaiNodeOptions {
    unstructured_server_url: String,
    embeddings_server_url: String,
    first_device_needs_registration_code: String,
    initial_agent_names: String,
    initial_agent_urls: String,
    initial_agent_models: String,
    initial_agent_api_keys: String,
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
                unstructured_server_url: if opts.unstructured_server_url.is_empty() {
                    default_options.unstructured_server_url
                } else {
                    opts.unstructured_server_url
                },
                embeddings_server_url: if opts.embeddings_server_url.is_empty() {
                    default_options.embeddings_server_url
                } else {
                    opts.embeddings_server_url
                },
                first_device_needs_registration_code: if opts
                    .first_device_needs_registration_code
                    .is_empty()
                {
                    default_options.first_device_needs_registration_code
                } else {
                    opts.first_device_needs_registration_code
                },
                initial_agent_names: if opts.initial_agent_names.is_empty() {
                    default_options.initial_agent_names
                } else {
                    opts.initial_agent_names
                },
                initial_agent_urls: if opts.initial_agent_urls.is_empty() {
                    default_options.initial_agent_urls
                } else {
                    opts.initial_agent_urls
                },
                initial_agent_models: if opts.initial_agent_models.is_empty() {
                    default_options.initial_agent_models
                } else {
                    opts.initial_agent_models
                },
                initial_agent_api_keys: if opts.initial_agent_api_keys.is_empty() {
                    default_options.initial_agent_api_keys
                } else {
                    opts.initial_agent_api_keys
                },
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
            unstructured_server_url: "https://public.shinkai.com/x-un".to_string(),
            embeddings_server_url: "https://public.shinkai.com/x-em".to_string(),
            first_device_needs_registration_code: "false".to_string(),
            initial_agent_names: "ollama_mistral".to_string(),
            initial_agent_urls: "http://localhost:11434".to_string(),
            initial_agent_models: "ollama:mistral".to_string(),
            initial_agent_api_keys: "".to_string(),
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

    fn add_log(&self, log_entry: String) {
        let mut logs = self.logs.lock().unwrap();
        if logs.len() == ShinkaiNodeManager::MAX_LOGS_LENGTH {
            logs.remove(0); // Remove the oldest log entry to make space
        }
        logs.push(log_entry.clone()); // Add the new log entry
        println!("{:?}", log_entry);
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
