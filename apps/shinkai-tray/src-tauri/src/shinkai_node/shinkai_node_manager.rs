use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::api::process::{Command, CommandChild, CommandEvent};

pub struct ShinkaiNodeManager {
    process: Arc<Mutex<Option<CommandChild>>>,
}

impl ShinkaiNodeManager {
    /// Initializes a new SidecarManager
    pub(crate) fn new() -> Self {
      ShinkaiNodeManager {
        process: Arc::new(Mutex::new(None)),
      }
    }

    /// Checks if the shinkai node process is running.
    pub fn is_running(&self) -> bool {
        let process = self.process.lock().unwrap();
        process.is_some()
    }

    /// Spawns the shinkai-node process
    pub fn spawn_shinkai_node(&self) {
        let mut process = self.process.lock().unwrap();
        if process.is_none() {
          let mut env = HashMap::new();

          env.insert("UNSTRUCTURED_SERVER_URL".to_string(), "https://public.shinkai.com/x-un".to_string());
          env.insert("EMBEDDINGS_SERVER_URL".to_string(), "https://public.shinkai.com/x-em".to_string());
          env.insert("FIRST_DEVICE_NEEDS_REGISTRATION_CODE".to_string(), "false".to_string());
          env.insert("INITIAL_AGENT_NAMES".to_string(), "ollama_llama2".to_string());
          env.insert("INITIAL_AGENT_URLS".to_string(), "http://localhost:11434".to_string());
          env.insert("INITIAL_AGENT_MODELS".to_string(), "ollama:llama2".to_string());
          env.insert("INITIAL_AGENT_API_KEYS".to_string(), "".to_string());

          let (mut rx, mut child) = Command::new_sidecar("shinkai-node-v0.5.1")
            .expect("shinkai-node binary not found")
            .envs(env)
            .spawn()
            .expect("Failed to spawn shinkai-node");

          tauri::async_runtime::spawn(async move {
              // read events such as stdout
              while let Some(event) = rx.recv().await {
                  if let CommandEvent::Stdout(line) = event.clone() {
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
