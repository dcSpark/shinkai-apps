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
}

impl ShinkaiNodeManager {
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
        }
    }

    fn default_options() -> ShinkaiNodeOptions {
        ShinkaiNodeOptions {
            unstructured_server_url: "https://public.shinkai.com/x-un".to_string(),
            embeddings_server_url: "https://public.shinkai.com/x-em".to_string(),
            first_device_needs_registration_code: "false".to_string(),
            initial_agent_names: "ollama_llama2".to_string(),
            initial_agent_urls: "http://localhost:11434".to_string(),
            initial_agent_models: "ollama:llama2".to_string(),
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
            let (mut rx, mut child) = Command::new_sidecar("shinkai-node-v0.5.1")
                .map_err(|_| "shinkai-node binary not found".to_string())?
                .envs(env)
                .spawn()
                .map_err(|_| "Failed to spawn shinkai-node".to_string())?;

            tauri::async_runtime::spawn(async move {
                // read events such as stdout
                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event.clone() {
                        println!("{:?}", &line);
                    }
                    if let CommandEvent::Stderr(line) = event.clone() {
                        println!("{:?}", &line);
                    }
                    if let CommandEvent::Error(line) = event.clone() {
                        println!("{:?}", &line);
                    }
                    // If the event is the end of the child process, print the output.
                    if let CommandEvent::Terminated(payload) = event {
                        println!("Child exited with code {:?}", payload.code);
                        break;
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
