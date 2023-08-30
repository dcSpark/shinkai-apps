use regex::Regex;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, sync::Arc};
use tauri::api::process::{Command, CommandChild, CommandEvent};
use tokio::sync::mpsc::Sender;
use tokio::sync::Mutex;

use super::{
    logger::{LogEntry, Logger},
    process_utils::kill_process_by_name,
};

#[derive(Debug, Serialize, Deserialize)]
pub enum ProcessHandlerEvent {
    Started,
    Stopped,
    Log(LogEntry),
    Error(String),
}

pub struct ProcessHandler {
    process_name: String,
    ready_matcher: Regex,
    process: Arc<Mutex<Option<CommandChild>>>,
    logger: Arc<Mutex<Logger>>,
    event_sender: Arc<Mutex<Sender<ProcessHandlerEvent>>>,
}

impl ProcessHandler {
    const MAX_LOGS_LENGTH: usize = 500;
    const MIN_MS_ALIVE: u64 = 5000;

    /// Initializes a new ShinkaiNodeManager with default or provided options
    pub(crate) fn new(process_name: String, event_sender: Sender<ProcessHandlerEvent>, ready_matcher: Regex) -> Self {
        kill_process_by_name(process_name.as_str());
        ProcessHandler {
            process_name: process_name.clone(),
            ready_matcher,
            event_sender: Arc::new(Mutex::new(event_sender)),
            process: Arc::new(Mutex::new(None)),
            logger: Arc::new(Mutex::new(Logger::new(
                Self::MAX_LOGS_LENGTH,
                process_name.clone(),
            ))),
        }
    }

    async fn emit_event(&self, event: ProcessHandlerEvent) {
        let event_sender = self.event_sender.lock().await;
        let _ = event_sender.send(event).await;
    }

    fn command_event_to_message(event: CommandEvent) -> String {
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
        line
    }

    pub async fn get_last_n_logs(&self, n: usize) -> Vec<LogEntry> {
        let logger = self.logger.lock().await;
        logger.get_last_n_logs(n)
    }

    pub async fn is_running(&self) -> bool {
        let process = self.process.lock().await;
        process.is_some()
    }

    pub async fn spawn(&self, env: HashMap<String, String>, args: Vec<&str>) -> Result<(), String> {
        {
            let process = self.process.lock().await;
            if process.is_some() {
                println!("process {} is already running", self.process_name);
                return Ok(());
            }
        }

        let mut logger = self.logger.lock().await;
        let (mut rx, child) = Command::new_sidecar(self.process_name.clone())
            .map_err(|error| {
                let message = format!("failed to spawn, error: {}", error);
                logger.add_log(message.clone());
                message
            })?
            .envs(env.clone())
            .args(args)
            .spawn()
            .map_err(|error| {
                let message = format!("failed to spawn error: {}", error);
                logger.add_log(message.clone());
                message
            })?;
        drop(logger);

        {
            let mut process = self.process.lock().await;
            *process = Some(child);
        }

        let process_mutex = Arc::clone(&self.process);
        let logger_mutex = Arc::clone(&self.logger);
        let event_sender_mutex = Arc::clone(&self.event_sender);
        let is_ready_mutex = Arc::new(Mutex::new(false));
        let is_ready_mutex_clone = is_ready_mutex.clone();

        let ready_matcher = self.ready_matcher.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                let message = Self::command_event_to_message(event.clone());
                let mut logger = logger_mutex.lock().await;
                let log_entry = logger.add_log(message.clone());
                let event_sender = event_sender_mutex.lock().await;
                let _ = event_sender.send(ProcessHandlerEvent::Log(log_entry)).await;
                if matches!(event, CommandEvent::Terminated { .. }) {
                    let mut process = process_mutex.lock().await;
                    *process = None;
                    let _ = event_sender.send(ProcessHandlerEvent::Stopped).await;
                }
                if ready_matcher.is_match(&message) {
                    let mut is_ready = is_ready_mutex.lock().await;
                    *is_ready = true;
                }
            }
        });

        let start_time = std::time::Instant::now();
        let logger_mutex = self.logger.clone();
        let process_mutex = self.process.clone();
        let event_sender_mutex = Arc::clone(&self.event_sender);
        tauri::async_runtime::spawn(async move {
            while std::time::Instant::now().duration_since(start_time)
                < std::time::Duration::from_millis(Self::MIN_MS_ALIVE)
            {
                let process = process_mutex.lock().await;
                let is_ready = is_ready_mutex_clone.lock().await;
                if process.is_none() {
                    let event_sender = event_sender_mutex.lock().await;
                    let mut logger = logger_mutex.lock().await;
                    let message = "failed to spawn shinkai-node, it crashed before min time alive"
                        .to_string();
                    let log_entry = logger.add_log(message.clone());
                    let _ = event_sender.send(ProcessHandlerEvent::Log(log_entry)).await;
                    return Err(message.to_string());
                } else if *is_ready {
                    break;
                }
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
            Ok(())
        })
        .await
        .unwrap()?;

        self.emit_event(ProcessHandlerEvent::Started).await;
        Ok(())
    }

    pub async fn kill(&self) {
        let mut process = self.process.lock().await;
        if let Some(child) = process.take() {
            match child.kill() {
                Ok(_) => println!("{}: process killed", self.process_name),
                Err(e) => println!("{}: failed to kill {}", self.process_name, e),
            }
            *process = None;
            let event_sender = self.event_sender.lock().await;
            let _ = event_sender.send(ProcessHandlerEvent::Stopped).await;
        } else {
            println!("no process is running");
        }
    }
}
