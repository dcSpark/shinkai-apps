use serde::Serialize;

/// It matches ENV variables names from ShinkaiNode
#[derive(Serialize, Clone)]
pub struct ShinkaiNodeOptions {
    pub port: Option<u32>,
    pub node_storage_path: Option<String>,
    pub unstructured_server_url: Option<String>,
    pub embeddings_server_url: Option<String>,
    pub first_device_needs_registration_code: Option<String>,
    pub initial_agent_names: Option<String>,
    pub initial_agent_urls: Option<String>,
    pub initial_agent_models: Option<String>,
    pub initial_agent_api_keys: Option<String>,
}
