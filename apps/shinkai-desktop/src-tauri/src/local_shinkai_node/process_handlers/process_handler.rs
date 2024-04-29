use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tauri::api::process::{Command, CommandChild, CommandEvent};
use tokio::sync::mpsc::Sender;
use tokio::sync::Mutex;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: i64,
    pub process: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ProcessHandlerEvent {
    Started,
    Stopped,
    Log(String),
    Error(String),
}

pub struct ProcessHandler {
    process_name: String,
    process: Arc<Mutex<Option<CommandChild>>>,
    logs: Arc<Mutex<Vec<LogEntry>>>,
    event_sender: Arc<Mutex<Sender<ProcessHandlerEvent>>>,
}

impl ProcessHandler {
    const MAX_LOGS_LENGTH: usize = 500;
    const MIN_MS_ALIVE: u64 = 3000;

    /// Initializes a new ShinkaiNodeManager with default or provided options
    pub(crate) fn new(process_name: String, event_sender: Sender<ProcessHandlerEvent>) -> Self {
        ProcessHandler {
            process_name,
            event_sender: Arc::new(Mutex::new(event_sender)),
            process: Arc::new(Mutex::new(None)),
            logs: Arc::new(Mutex::new(Vec::with_capacity(Self::MAX_LOGS_LENGTH))),
        }
    }

    async fn emit_event(&self, event: ProcessHandlerEvent) {
        let event_sender = self.event_sender.lock().await;
        let _ = event_sender.send(event).await;
    }

    async fn add_log(&self, log_entry: String) {
        let mut logs = self.logs.lock().await;
        if logs.len() == ProcessHandler::MAX_LOGS_LENGTH {
            logs.remove(0); // Remove the oldest log entry to make space
        }
        let current_timestamp = chrono::Utc::now().timestamp();
        logs.push(LogEntry {
            timestamp: current_timestamp,
            process: self.process_name.to_string(),
            message: log_entry.clone(),
        }); // Add the new log entry
        self.emit_event(ProcessHandlerEvent::Log(log_entry.clone()))
            .await;
        println!("{}", log_entry);
    }

    async fn command_event_to_log(
        logs_mutex: Arc<Mutex<Vec<LogEntry>>>,
        event: CommandEvent,
        process_name: String,
    ) {
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
            logs.push(LogEntry {
                timestamp: chrono::Utc::now().timestamp(),
                process: process_name,
                message: line.clone(),
            });
            println!("{}", line.clone());
        }
    }

    /// Retrieves the last `n` logs.
    /// If `n` is greater than the available logs, it returns all logs.
    pub async fn get_last_n_logs(&self, n: usize) -> Vec<LogEntry> {
        let logs = self.logs.lock().await;
        let parsed_logs: Vec<LogEntry> = if n >= logs.len() {
            logs.clone()
        } else {
            logs.as_slice()[logs.len() - n..].to_vec()
        };
        parsed_logs
            .into_iter()
            .filter(|value| !value.message.is_empty())
            .collect()
    }

    /// Checks if the shinkai node process is running.
    pub async fn is_running(&self) -> bool {
        let process = self.process.lock().await;
        process.is_some()
    }

    pub async fn spawn(&self, env: HashMap<String, String>, args: Vec<&str>) -> Result<(), String> {
        let mut process = self.process.lock().await;
        if process.is_some() {
            println!("process {} is already running", self.process_name);
            return Ok(());
        }
        let (mut rx, child) = Command::new_sidecar(self.process_name.clone())
            .map_err(|error| {
                let log = format!(
                    "failed to spawn {} error: {}",
                    self.process_name,
                    error.to_string()
                );
                self.add_log(log.clone());
                log
            })?
            .envs(env.clone())
            .args(args)
            .spawn()
            .map_err(|error| {
                let log = format!(
                    "failed to spawn {} error: {}",
                    self.process_name,
                    error.to_string()
                );
                self.add_log(log.clone());
                log
            })?;

        // It gives a readycheck time because some process crash after a successfully start
        let logs_mutex = Arc::clone(&self.logs);
        let start_time = std::time::Instant::now();
        while std::time::Instant::now().duration_since(start_time)
            < std::time::Duration::from_millis(Self::MIN_MS_ALIVE)
        {
            if let Ok(event) = rx.try_recv() {
                Self::command_event_to_log(
                    logs_mutex.clone(),
                    event.clone(),
                    self.process_name.clone(),
                )
                .await;
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

        *process = Some(child);

        let process_mutex = Arc::clone(&self.process);
        let process_name = self.process_name.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                Self::command_event_to_log(logs_mutex.clone(), event.clone(), process_name.clone())
                    .await;
                if matches!(event, CommandEvent::Terminated { .. }) {
                    let mut process = process_mutex.lock().await;
                    *process = None;
                    // self.emit_event(ProcessHandlerEvent::Stopped).await;
                }
            }
        });
        self.emit_event(ProcessHandlerEvent::Started).await;
        Ok(())
    }

    /// Kill the spawned shinkai-node process
    pub async fn kill(&self) {
        let mut process = self.process.lock().await;
        if let Some(child) = process.take() {
            match child.kill() {
                Ok(_) => println!("{}: process killed", self.process_name),
                Err(e) => println!("{}: failed to kill {}", self.process_name, e),
            }
            *process = None;
        } else {
            println!("no process is running");
        }
    }
}
