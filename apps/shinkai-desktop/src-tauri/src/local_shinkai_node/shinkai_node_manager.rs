use std::path::PathBuf;
use std::fs;

use super::ollama_api::ollama_api_client::OllamaApiClient;
use super::ollama_api::ollama_api_types::OllamaApiPullResponse;
use super::process_handlers::ollama_process_handler::OllamaProcessHandler;
use super::process_handlers::shinkai_node_process_handler::ShinkaiNodeProcessHandler;
use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;
use crate::models::embedding_model;
use anyhow::Result;
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use tauri::AppHandle;
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

    CreatingModelStart { model: String },
    CreatingModelProgress { model: String, progress: u32 },
    CreatingModelDone { model: String },
    CreatingModelError { model: String, error: String },

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
    app_resource_dir: PathBuf,
}

impl ShinkaiNodeManager {
    pub(crate) fn new(app: AppHandle, app_resource_dir: PathBuf, app_data_dir: PathBuf) -> Self {
        let (ollama_sender, _ollama_receiver) = channel(100);
        let (shinkai_node_sender, _shinkai_node_receiver) = channel(100);
        let (event_broadcaster, _) = broadcast::channel(10);

        ShinkaiNodeManager {
            ollama_process: OllamaProcessHandler::new(
                app.clone(),
                ollama_sender,
                app_resource_dir.clone(),
            ),
            shinkai_node_process: ShinkaiNodeProcessHandler::new(
                app,
                shinkai_node_sender,
                app_resource_dir.clone(),
                app_data_dir,
            ),
            event_broadcaster,
            app_resource_dir,
        }
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
                log::info!("failed spawning ollama process {:?}", e);
                self.kill().await;
                self.emit_event(ShinkaiNodeManagerEvent::OllamaStartError { error: e.clone() });
                return Err(e);
            }
        }

        let ollama_api_url = self.ollama_process.get_ollama_api_base_url();
        let ollama_api = OllamaApiClient::new(ollama_api_url);

        let installed_models_response = ollama_api.tags().await;
        if let Err(e) = installed_models_response {
            log::info!("failed spawning ollama process api tags {:?}", e);
            self.kill().await;
            self.emit_event(ShinkaiNodeManagerEvent::OllamaStartError {
                error: "unable to list installed models".to_string(),
            });
            return Err(e.to_string());
        }
        let installed_models: Vec<String> = installed_models_response
            .unwrap()
            .models
            .iter()
            .map(|m| m.model.clone())
            .collect();
        let default_embedding_model = self
            .shinkai_node_process
            .get_options()
            .default_embedding_model
            .unwrap();
        if !installed_models.contains(&default_embedding_model.to_string()) { // ***
            self.emit_event(ShinkaiNodeManagerEvent::CreatingModelStart {
                model: default_embedding_model.to_string(),
            });

            // Use the embedded GGUF model
            let gguf_data = embedding_model::get_model_data();

            match ollama_api.create_model_from_gguf(&default_embedding_model, gguf_data).await {
                Ok(_) => {
                    self.emit_event(ShinkaiNodeManagerEvent::CreatingModelDone {
                        model: default_embedding_model.to_string(),
                    });
                }
                Err(e) => {
                    self.kill().await;
                    self.emit_event(ShinkaiNodeManagerEvent::CreatingModelError {
                        model: default_embedding_model.to_string(),
                        error: e.to_string(),
                    });
                    return Err(e.to_string());
                }
            }
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
        self.shinkai_node_process
            .remove_storage(preserve_keys)
            .await
    }

    pub fn open_storage_location(&self) -> Result<(), String> {
        self.shinkai_node_process.open_storage_location()
    }

    pub fn open_storage_location_with_path(&self, relative_path: &str) -> Result<(), String> {
        self.shinkai_node_process.open_storage_location_with_path(relative_path)
    }

    pub fn open_chat_folder(&self, storage_location: &str, chat_folder_name: &str) -> Result<(), String> {
        self.shinkai_node_process.open_chat_folder(storage_location, chat_folder_name)
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

    pub fn get_ollama_api_url(&self) -> String {
        self.ollama_process.get_ollama_api_base_url()
    }

    pub async fn get_ollama_version(app: AppHandle) -> Result<String> {
        OllamaProcessHandler::version(app).await
    }
}
