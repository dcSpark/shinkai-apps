use serde::{Deserialize, Serialize};

/// It matches ENV variables names from ShinkaiNode
#[derive(Serialize, Deserialize, Clone)]
pub struct ShinkaiNodeOptions {
    pub port: Option<String>,
    pub ws_port: Option<String>,
    pub node_storage_path: Option<String>,
    pub unstructured_server_url: Option<String>,
    pub embeddings_server_url: Option<String>,
    pub first_device_needs_registration_code: Option<String>,
    pub initial_agent_names: Option<String>,
    pub initial_agent_urls: Option<String>,
    pub initial_agent_models: Option<String>,
    pub initial_agent_api_keys: Option<String>,
    pub starting_num_qr_devices: Option<String>,
    pub log_all: Option<String>,
}
