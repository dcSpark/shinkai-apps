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

#[derive(Debug, Serialize, Deserialize)]
pub enum ProcessHandlerEvent {
    Started,
    Stopped,
    Error(String),
}

pub struct ProcessHandler {
    app: AppHandle,
    process_name: String,
    ready_matcher: Regex,
    process: Arc<RwLock<Option<CommandChild>>>,
    event_sender: Arc<Mutex<Sender<ProcessHandlerEvent>>>,
}

impl ProcessHandler {
    const MIN_MS_ALIVE: u64 = 5000;
    const PORT_RELEASE_DELAY_MS: u64 = 1000;

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
            process: Arc::new(RwLock::new(None)),
        }
    }

    async fn emit_event(&self, event: ProcessHandlerEvent) {
        log::debug!("[{}] emitting event: {:?}", self.process_name, event);
        let event_sender = self.event_sender.lock().await;
        let _ = event_sender.send(event).await;
    }

    fn command_event_to_message_log(process_name: &str, event: CommandEvent) {
        match event {
            CommandEvent::Stdout(message) => {
                log::info!(target: process_name, "{}", String::from_utf8_lossy(&message));
            }
            CommandEvent::Stderr(message) => {
                log::error!(target: process_name, "{}", String::from_utf8_lossy(&message));
            }
            CommandEvent::Error(message) => {
                log::error!("[{}] error: {}", process_name, message);
            }
            CommandEvent::Terminated(payload) => {
                log::info!(
                    "[{}] process terminated with code:{:?} and signal:{:?}",
                    process_name,
                    payload.code,
                    payload.signal
                );
            }
            _ => {}
        }
    }

    pub async fn is_running(&self) -> bool {
        let process = self.process.read().await;
        let running = process.is_some();
        running
    }

    pub async fn spawn(
        &self,
        env: HashMap<String, String>,
        args: Vec<&str>,
        current_dir: Option<PathBuf>,
    ) -> Result<(), String> {
        log::info!(
            "[{}] attempting to spawn process with args {:?} and env {:?}",
            self.process_name,
            args,
            env
        );
        {
            let process = self.process.read().await;
            if process.is_some() {
                log::warn!("[{}] process is already running", self.process_name);
                return Ok(());
            }
        }

        let shell = self.app.shell();
        let (mut rx, child) = shell
            .sidecar(self.process_name.clone())
            .map_err(|error| {
                let message = format!("failed to spawn, error: {}", error);
                log::error!("[{}] {}", self.process_name, message);
                message
            })?
            .envs(env.clone())
            .current_dir(current_dir.unwrap_or_else(|| std::path::PathBuf::from("./")))
            .args(args)
            .spawn()
            .map_err(|error| {
                let message = format!("failed to spawn error: {}", error);
                log::error!("[{}] {}", self.process_name, message);
                message
            })?;

        log::info!(
            "[{}] process spawned successfully with pid: {:?}",
            self.process_name,
            child.pid()
        );

        {
            let mut process = self.process.write().await;
            *process = Some(child);
            log::info!("[{}] process stored in state", self.process_name);
        }

        let process_mutex = Arc::clone(&self.process);
        let event_sender_mutex = Arc::clone(&self.event_sender);
        let is_ready_mutex = Arc::new(Mutex::new(false));
        let is_ready_mutex_clone = is_ready_mutex.clone();
        let process_name = self.process_name.clone();

        let ready_matcher = self.ready_matcher.clone();
        tauri::async_runtime::spawn(async move {
            while let Some(event) = rx.recv().await {
                Self::command_event_to_message_log(&process_name, event.clone());
                match event {
                    CommandEvent::Terminated(_) => {
                        {
                            let mut process = process_mutex.write().await;
                            *process = None;
                        }
                        {
                            let event_sender = event_sender_mutex.lock().await;
                            let _ = event_sender.send(ProcessHandlerEvent::Stopped).await;
                        }
                        break;
                    }
                    CommandEvent::Stdout(message) => {
                        let message_str = String::from_utf8_lossy(&message);
                        if ready_matcher.is_match(&message_str) {
                            log::info!(
                                "[{}] process ready signal detected in message: {}",
                                process_name,
                                message_str
                            );
                            let mut is_ready = is_ready_mutex.lock().await;
                            *is_ready = true;
                        }
                    }
                    _ => {}
                }
            }
        });

        let start_time = std::time::Instant::now();
        let process_mutex = self.process.clone();
        let process_name = self.process_name.clone();
        tauri::async_runtime::spawn(async move {
            while std::time::Instant::now().duration_since(start_time)
                < std::time::Duration::from_millis(Self::MIN_MS_ALIVE)
            {
                let process = process_mutex.read().await;
                let is_ready = is_ready_mutex_clone.lock().await;
                log::debug!(
                    "[{}] alive-check: process.is_none={}, is_ready={}, elapsed={:?}",
                    process_name,
                    process.is_none(),
                    *is_ready,
                    std::time::Instant::now().duration_since(start_time)
                );

                if process.is_none() {
                    let message = format!(
                        "Process ended before min time alive (this may be normal if it completed its task)"
                    );
                    log::warn!("[{}] {}", process_name, message);
                    return Err(message.to_string());
                } else if *is_ready {
                    log::info!(
                        "[{}] process passed minimum alive time check after {:?}",
                        process_name,
                        std::time::Instant::now().duration_since(start_time)
                    );
                    break;
                }
                drop(process);
                drop(is_ready);
                tokio::time::sleep(std::time::Duration::from_millis(500)).await;
            }
            Ok::<(), String>(())
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
        let mut process = self.process.write().await;
        if let Some(child) = process.take() {
            let pid = child.pid();
            log::warn!(
                "[{}] about to kill process with pid={:?} via kill_tree",
                self.process_name,
                pid
            );
            let kill_result = kill_tree::tokio::kill_tree(pid).await;
            match kill_result {
                Ok(_) => {
                    log::info!(
                        "[{}] process with pid={:?} killed successfully via kill_tree",
                        self.process_name,
                        pid
                    );
                    tokio::time::sleep(std::time::Duration::from_millis(
                        Self::PORT_RELEASE_DELAY_MS,
                    ))
                    .await;
                }
                Err(e) => log::warn!(
                    "[{}] failed to kill process with pid={:?}: {}",
                    self.process_name,
                    pid,
                    e
                ),
            }
            *process = None;
            drop(process);
            let event_sender = self.event_sender.lock().await;
            let _ = event_sender.send(ProcessHandlerEvent::Stopped).await;
        } else {
            log::error!("[{}] no process is running to kill", self.process_name);
        }
    }
}
