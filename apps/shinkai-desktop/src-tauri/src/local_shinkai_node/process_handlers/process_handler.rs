use regex::Regex;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, path::PathBuf, sync::Arc};
use tauri::AppHandle;
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};
use tokio::sync::Mutex;
use tokio::sync::{mpsc::Sender, RwLock};

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
    app: AppHandle,
    process_name: String,
    ready_matcher: Regex,
    process: Arc<Mutex<Option<CommandChild>>>,
    logger: Arc<RwLock<Logger>>,
    event_sender: Arc<Mutex<Sender<ProcessHandlerEvent>>>,
}

impl ProcessHandler {
    const MAX_LOGS_LENGTH: usize = 500;
    const MIN_MS_ALIVE: u64 = 5000;

    /// Initializes a new ShinkaiNodeManager with default or provided options
    pub(crate) fn new(
        app: AppHandle,
        process_name: String,
        event_sender: Sender<ProcessHandlerEvent>,
        ready_matcher: Regex,
    ) -> Self {
        log::info!("[{}] creating new process handler", process_name);
        ProcessHandler {
            app,
            process_name: process_name.clone(),
            ready_matcher,
            event_sender: Arc::new(Mutex::new(event_sender)),
            process: Arc::new(Mutex::new(None)),
            logger: Arc::new(RwLock::new(Logger::new(
                Self::MAX_LOGS_LENGTH,
                process_name.clone(),
            ))),
        }
    }

    async fn emit_event(&self, event: ProcessHandlerEvent) {
        log::debug!("[{}] emitting event: {:?}", self.process_name, event);
        let event_sender = self.event_sender.lock().await;
        let _ = event_sender.send(event).await;
    }

    fn command_event_to_message(event: CommandEvent) -> String {
        let mut line: String = "".to_string();
        match event {
            CommandEvent::Stdout(message) => {
                line = String::from_utf8_lossy(&message).to_string();
            }
            CommandEvent::Stderr(message) => {
                line = String::from_utf8_lossy(&message).to_string();
            }
            CommandEvent::Error(message) => {
                line = message;
            }
            CommandEvent::Terminated(payload) => {
                line = format!(
                    "process terminated with code:{:?} and signal:{:?}",
                    payload.code, payload.signal
                );
            }
            _ => {}
        }
        line
    }

    pub async fn get_last_n_logs(&self, n: usize) -> Vec<LogEntry> {
        log::debug!("[{}] getting last {} logs", self.process_name, n);
        let logger = self.logger.read().await;
        logger.get_last_n_logs(n)
    }

    pub async fn is_running(&self) -> bool {
        let process = self.process.lock().await;
        let running = process.is_some();
        log::debug!(
            "[{}] checking if process is running: {}",
            self.process_name,
            running
        );
        running
    }

    pub async fn spawn(
        &self,
        env: HashMap<String, String>,
        args: Vec<&str>,
        current_dir: Option<PathBuf>,
    ) -> Result<(), String> {
        log::info!(
            "[{}] attempting to spawn process with args {:?}",
            self.process_name,
            args
        );
        {
            let process = self.process.lock().await;
            if process.is_some() {
                log::warn!("[{}] process is already running", self.process_name);
                return Ok(());
            }
        }

        let mut logger = self.logger.write().await;
        let shell = self.app.shell();
        let (mut rx, child) = shell
            .sidecar(self.process_name.clone())
            .map_err(|error| {
                let message = format!("failed to spawn, error: {}", error);
                log::error!("[{}] {}", self.process_name, message);
                logger.add_log(message.clone());
                message
            })?
            .envs(env.clone())
            .current_dir(current_dir.unwrap_or_else(|| std::path::PathBuf::from("./")))
            .args(args)
            .spawn()
            .map_err(|error| {
                let message = format!("failed to spawn error: {}", error);
                log::error!("[{}] {}", self.process_name, message);
                logger.add_log(message.clone());
                message
            })?;
        drop(logger);

        {
            let mut process = self.process.lock().await;
            *process = Some(child);
            log::info!("[{}] process spawned successfully", self.process_name);
        }

        let process_mutex = Arc::clone(&self.process);
        let logger_mutex = Arc::clone(&self.logger);
        let event_sender_mutex = Arc::clone(&self.event_sender);
        let is_ready_mutex = Arc::new(Mutex::new(false));
        let is_ready_mutex_clone = is_ready_mutex.clone();
        let process_name = self.process_name.clone();

        let ready_matcher = self.ready_matcher.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                let message = Self::command_event_to_message(event.clone());
                log::debug!("[{}] received process event: {}", process_name, message);
                let log_entry;
                {
                    let mut logger = logger_mutex.write().await;
                    log_entry = logger.add_log(message.clone());
                }
                {
                    let event_sender = event_sender_mutex.lock().await;
                    let _ = event_sender.send(ProcessHandlerEvent::Log(log_entry)).await;
                }
                if matches!(event, CommandEvent::Terminated { .. }) {
                    log::info!("[{}] process terminated", process_name);
                    {
                        let mut process = process_mutex.lock().await;
                        *process = None;
                    }
                    {
                        let event_sender = event_sender_mutex.lock().await;
                        let _ = event_sender.send(ProcessHandlerEvent::Stopped).await;
                    }
                    break;
                }
                if ready_matcher.is_match(&message) {
                    log::info!("[{}] process ready signal detected", process_name);
                    let mut is_ready = is_ready_mutex.lock().await;
                    *is_ready = true;
                    break;
                }
            }
        });

        let start_time = std::time::Instant::now();
        let logger_mutex = self.logger.clone();
        let process_mutex = self.process.clone();
        let event_sender_mutex = Arc::clone(&self.event_sender);
        let process_name = self.process_name.clone();
        tauri::async_runtime::spawn(async move {
            while std::time::Instant::now().duration_since(start_time)
                < std::time::Duration::from_millis(Self::MIN_MS_ALIVE)
            {
                let process = process_mutex.lock().await;
                let is_ready = is_ready_mutex_clone.lock().await;
                if process.is_none() {
                    let message =
                        "failed to spawn process, it crashed before min time alive".to_string();
                    log::error!("[{}] {}", process_name, message);
                    let log_entry: LogEntry;
                    {
                        let mut logger = logger_mutex.write().await;
                        log_entry = logger.add_log(message.clone());
                    }
                    {
                        let event_sender = event_sender_mutex.lock().await;
                        let _ = event_sender.send(ProcessHandlerEvent::Log(log_entry)).await;
                    }
                    return Err(message.to_string());
                } else if *is_ready {
                    log::info!("[{}] process passed minimum alive time check", process_name);
                    break;
                }
                drop(process);
                drop(is_ready);
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
            Ok(())
        })
        .await
        .unwrap()?;

        log::info!(
            "[{}] process spawn completed successfully",
            self.process_name
        );
        self.emit_event(ProcessHandlerEvent::Started).await;

        Ok(())
    }

    pub async fn kill(&self) {
        log::info!("[{}] attempting to kill process", self.process_name);
        let mut process = self.process.lock().await;
        if let Some(child) = process.take() {
            let kill_result = kill_tree::tokio::kill_tree(child.pid()).await;
            match kill_result {
                Ok(_) => log::info!("[{}] process killed", self.process_name),
                Err(e) => log::warn!("[{}] failed to kill: {}", self.process_name, e),
            }
            *process = None;
            drop(process);
            let event_sender = self.event_sender.lock().await;
            let _ = event_sender.send(ProcessHandlerEvent::Stopped).await;
        } else {
            log::error!("[{}] no process is running", self.process_name);
        }
    }
}
