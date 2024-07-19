use super::ollama_api::ollama_api_client::OllamaApiClient;
use super::ollama_api::ollama_api_types::OllamaApiPullResponse;
use super::process_handlers::logger::LogEntry;
use super::process_handlers::ollama_process_handler::OllamaProcessHandler;
use super::process_handlers::shinkai_node_process_handler::ShinkaiNodeProcessHandler;
use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tokio::sync::broadcast;
use tokio::sync::mpsc::channel;

#[derive(Serialize, Deserialize, Clone)]
pub enum ShinkaiNodeManagerEvent {
    StartingShinkaiNode,
    ShinkaiNodeStarted,
    ShinkaiNodeStartError { error: String },

    StartingOllama,
    OllamaStarted,
    OllamaStartError { error: String },

    PullingModelStart { model: String },
    PullingModelProgress { model: String, progress: u32 },
    PullingModelDone { model: String },
    PullingModelError { model: String, error: String },

    StoppingShinkaiNode,
    ShinkaiNodeStopped,
    ShinkaiNodeStopError { error: String },

    StoppingOllama,
    OllamaStopped,
    OllamaStopError { error: String },
}

pub struct ShinkaiNodeManager {
    ollama_process: OllamaProcessHandler,
    shinkai_node_process: ShinkaiNodeProcessHandler,
    event_broadcaster: broadcast::Sender<ShinkaiNodeManagerEvent>,
}

impl ShinkaiNodeManager {
    pub(crate) fn new(default_node_storage_path: String) -> Self {
        let (ollama_sender, _ollama_receiver) = channel(100);
        let (shinkai_node_sender, _shinkai_node_receiver) = channel(100);
        let (event_broadcaster, _) = broadcast::channel(10);

        ShinkaiNodeManager {
            ollama_process: OllamaProcessHandler::new(
                None,
                ollama_sender,
            ),
            shinkai_node_process: ShinkaiNodeProcessHandler::new(shinkai_node_sender, default_node_storage_path),
            event_broadcaster,
        }
    }

    pub async fn get_last_n_shinkai_node_logs(&self, n: usize) -> Vec<LogEntry> {
        let shinkai_logs = self.shinkai_node_process.get_last_n_logs(n).await;
        let ollama_logs = self.ollama_process.get_last_n_logs(n).await;

        let mut merged_logs = shinkai_logs;
        merged_logs.extend(ollama_logs.into_iter());
        merged_logs.sort_by(|a, b| a.timestamp.cmp(&b.timestamp));
        merged_logs
    }

    pub async fn get_shinkai_node_options(&self) -> ShinkaiNodeOptions {
        let options = self.shinkai_node_process.get_options();
        options.clone()
    }

    pub async fn is_running(&self) -> bool {
        self.shinkai_node_process.is_running().await && self.ollama_process.is_running().await
    }

    pub async fn spawn(&mut self) -> Result<(), String> {
        self.emit_event(ShinkaiNodeManagerEvent::StartingOllama);
        match self.ollama_process.spawn(None).await {
            Ok(_) => {
                self.emit_event(ShinkaiNodeManagerEvent::OllamaStarted);
            }
            Err(e) => {
                self.kill().await;
                self.emit_event(ShinkaiNodeManagerEvent::OllamaStartError { error: e.clone() });
                return Err(e);
            }
        }

        let ollama_api_url = self.ollama_process.get_ollama_api_base_url();
        let ollama_api = OllamaApiClient::new(ollama_api_url);

        let installed_models_response = ollama_api.tags().await;
        if let Err(e) = installed_models_response {
            self.kill().await;
            self.emit_event(ShinkaiNodeManagerEvent::OllamaStartError { error: "unable to list installed models".to_string() });
            return Err(e.to_string());
        }
        let installed_models: Vec<String> = installed_models_response.unwrap().models.iter().map(|m| m.model.clone()).collect();
        let default_embedding_model = ShinkaiNodeOptions::default().default_embedding_model.unwrap();
        if !installed_models.contains(&default_embedding_model.to_string()) {
            self.emit_event(ShinkaiNodeManagerEvent::PullingModelStart {
                model: default_embedding_model.to_string(),
            });
            match ollama_api.pull_stream(&default_embedding_model).await {
                Ok(mut stream) => {
                    while let Some(stream_value) = stream.next().await {
                        match stream_value {
                            Ok(value) => {
                                if let OllamaApiPullResponse::Downloading {
                                    status: _,
                                    digest: _,
                                    total,
                                    completed,
                                } = value
                                {
                                    self.emit_event(ShinkaiNodeManagerEvent::PullingModelProgress {
                                        model: default_embedding_model.to_string(),
                                        progress: (completed as f32 / total as f32 * 100.0) as u32,
                                    });
                                }
                            },
                            Err(e) => {
                                self.kill().await;
                                self.emit_event(ShinkaiNodeManagerEvent::PullingModelError {
                                    model: default_embedding_model.to_string(),
                                    error: e.to_string(),
                                });
                                return Err(e.to_string())
                            },
                        }
                    }
                }
                Err(e) => {
                    self.kill().await;
                    self.emit_event(ShinkaiNodeManagerEvent::PullingModelError {
                        model: default_embedding_model.to_string(),
                        error: e.to_string(),
                    });
                    return Err(e.to_string());
                }
            }
            self.emit_event(ShinkaiNodeManagerEvent::PullingModelDone {
                model: default_embedding_model.to_string(),
            });
        }
        

        let mut default_model = ShinkaiNodeOptions::default().initial_agent_models.unwrap();
        default_model = default_model.replace("ollama:", "");

        if !installed_models.contains(&default_model.to_string()) {
            self.emit_event(ShinkaiNodeManagerEvent::PullingModelStart {
                model: default_model.to_string(),
            });
            match ollama_api.pull_stream(&default_model).await {
                Ok(mut stream) => {
                    while let Some(stream_value) = stream.next().await {
                        match stream_value {
                            Ok(value) => {
                                if let OllamaApiPullResponse::Downloading {
                                    status: _,
                                    digest: _,
                                    total,
                                    completed,
                                } = value
                                {
                                    self.emit_event(ShinkaiNodeManagerEvent::PullingModelProgress {
                                        model: default_model.to_string(),
                                        progress: (completed as f32 / total as f32 * 100.0) as u32,
                                    });
                                }
                            },
                            Err(e) => {
                                self.kill().await;
                                self.emit_event(ShinkaiNodeManagerEvent::PullingModelError {
                                    model: default_model.to_string(),
                                    error: e.to_string(),
                                });
                                return Err(e.to_string())
                            },
                        }
                    }
                }
                Err(e) => {
                    self.kill().await;
                    self.emit_event(ShinkaiNodeManagerEvent::PullingModelError {
                        model: default_model.to_string(),
                        error: e.to_string(),
                    });
                    return Err(e.to_string());
                }
            }
            self.emit_event(ShinkaiNodeManagerEvent::PullingModelDone {
                model: default_model.to_string(),
            });
        }

        self.emit_event(ShinkaiNodeManagerEvent::StartingShinkaiNode);
        match self.shinkai_node_process.spawn().await {
            Ok(_) => {
                self.emit_event(ShinkaiNodeManagerEvent::ShinkaiNodeStarted);
            }
            Err(e) => {
                self.kill().await;
                self.emit_event(ShinkaiNodeManagerEvent::ShinkaiNodeStartError {
                    error: e.clone(),
                });
                return Err(e);
            }
        }
        Ok(())
    }

    pub async fn kill(&mut self) {
        self.emit_event(ShinkaiNodeManagerEvent::StoppingShinkaiNode);
        self.shinkai_node_process.kill().await;
        self.emit_event(ShinkaiNodeManagerEvent::ShinkaiNodeStopped);
        self.emit_event(ShinkaiNodeManagerEvent::StoppingOllama);
        self.ollama_process.kill().await;
        self.emit_event(ShinkaiNodeManagerEvent::OllamaStopped);
    }

    pub async fn remove_storage(&self, preserve_keys: bool) -> Result<(), String> {
        self.shinkai_node_process.remove_storage(preserve_keys).await
    }

    pub async fn set_default_shinkai_node_options(&mut self) -> ShinkaiNodeOptions {
        self.shinkai_node_process.set_default_options()
    }

    pub async fn set_shinkai_node_options(
        &mut self,
        options: ShinkaiNodeOptions,
    ) -> ShinkaiNodeOptions {
        self.shinkai_node_process.set_options(options)
    }

    fn emit_event(&mut self, new_event: ShinkaiNodeManagerEvent) {
        let _ = self.event_broadcaster.send(new_event);
    }

    pub fn subscribe_to_events(
        &mut self,
    ) -> tokio::sync::broadcast::Receiver<ShinkaiNodeManagerEvent> {
        self.event_broadcaster.subscribe()
    }

    pub fn get_ollama_api_url(
        &self,
    ) -> String {
        self.ollama_process.get_ollama_api_base_url()
    }
}
