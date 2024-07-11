use serde::{Deserialize, Serialize};

use crate::hardware::{hardware_get_summary, RequirementsStatus};

/// It matches ENV variables names from ShinkaiNode
#[derive(Serialize, Deserialize, Clone)]
pub struct ShinkaiNodeOptions {
    pub node_api_ip: Option<String>,
    pub node_api_port: Option<String>,
    pub node_ws_port: Option<String>,
    pub node_ip: Option<String>,
    pub node_port: Option<String>,
    pub global_identity_name: Option<String>,
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
    pub proxy_identity: Option<String>,
    pub rpc_url: Option<String>,
}

impl ShinkaiNodeOptions {
    pub fn with_storage_path(default_node_storage_path: String) -> ShinkaiNodeOptions {
        ShinkaiNodeOptions {
            node_storage_path: Some(default_node_storage_path),
            ..Default::default()
        }
    }

    pub fn default_initial_model() -> String {
        let mut model = "llama3:8b-instruct-q4_1".to_string();
        let hardware_summary = hardware_get_summary();
        match hardware_summary.requirements_status {
            RequirementsStatus::Minimum => {
                model = "phi3:3.8b".to_string();
            }
            RequirementsStatus::StillUsable | RequirementsStatus::Unmeet => {
                model = "qwen2:1.5b-instruct-q4_K_M".to_string();
            }
            _ => {}
        }
        model
    }

    pub fn from_merge(
        base_options: ShinkaiNodeOptions,
        options: ShinkaiNodeOptions,
    ) -> ShinkaiNodeOptions {
        ShinkaiNodeOptions {
            node_api_ip: Some(
                options
                    .node_api_ip
                    .unwrap_or_else(|| base_options.node_api_ip.unwrap()),
            ),
            node_api_port: Some(
                options
                    .node_api_port
                    .unwrap_or_else(|| base_options.node_api_port.unwrap()),
            ),
            node_ws_port: Some(
                options
                    .node_ws_port
                    .unwrap_or_else(|| base_options.node_ws_port.unwrap()),
            ),
            node_ip: Some(
                options
                    .node_ip
                    .unwrap_or_else(|| base_options.node_ip.unwrap()),
            ),
            node_port: Some(
                options
                    .node_port
                    .unwrap_or_else(|| base_options.node_port.unwrap()),
            ),
            global_identity_name: Some(
                options
                    .global_identity_name
                    .unwrap_or_else(|| base_options.global_identity_name.unwrap()),
            ),
            node_storage_path: Some(
                options
                    .node_storage_path
                    .unwrap_or_else(|| base_options.node_storage_path.unwrap()),
            ),
            unstructured_server_url: Some(
                options
                    .unstructured_server_url
                    .unwrap_or_else(|| base_options.unstructured_server_url.unwrap()),
            ),
            embeddings_server_url: Some(
                options
                    .embeddings_server_url
                    .unwrap_or_else(|| base_options.embeddings_server_url.unwrap()),
            ),
            first_device_needs_registration_code: Some(
                options
                    .first_device_needs_registration_code
                    .unwrap_or_else(|| base_options.first_device_needs_registration_code.unwrap()),
            ),
            initial_agent_names: Some(
                options
                    .initial_agent_names
                    .unwrap_or_else(|| base_options.initial_agent_names.unwrap()),
            ),
            initial_agent_urls: Some(
                options
                    .initial_agent_urls
                    .unwrap_or_else(|| base_options.initial_agent_urls.unwrap()),
            ),
            initial_agent_models: Some(
                options
                    .initial_agent_models
                    .unwrap_or_else(|| base_options.initial_agent_models.unwrap()),
            ),
            initial_agent_api_keys: Some(
                options
                    .initial_agent_api_keys
                    .unwrap_or_else(|| base_options.initial_agent_api_keys.unwrap()),
            ),
            starting_num_qr_devices: Some(
                options
                    .starting_num_qr_devices
                    .unwrap_or_else(|| base_options.starting_num_qr_devices.unwrap()),
            ),
            log_all: Some(
                options
                    .log_all
                    .unwrap_or_else(|| base_options.log_all.unwrap()),
            ),
            proxy_identity: Some(
                options
                    .proxy_identity
                    .unwrap_or_else(|| base_options.proxy_identity.unwrap()),
            ),
            rpc_url: Some(
                options
                    .rpc_url
                    .unwrap_or_else(|| base_options.rpc_url.unwrap()),
            ),
        }
    }
}

impl Default for ShinkaiNodeOptions {
    fn default() -> ShinkaiNodeOptions {
        let initial_model = Self::default_initial_model();
        let initial_agent_names = format!(
            "o_{}",
            initial_model.replace(|c: char| !c.is_alphanumeric(), "_")
        );
        let initial_agent_models = format!("ollama:{}", initial_model);
        ShinkaiNodeOptions {
            node_api_ip: Some("127.0.0.1".to_string()),
            node_api_port: Some("9550".to_string()),
            node_ws_port: Some("9551".to_string()),
            node_ip: Some("127.0.0.1".to_string()),
            node_port: Some("9552".to_string()),
            global_identity_name: Some("@@localhost.arb-sep-shinkai".to_string()),
            node_storage_path: Some("./".to_string()),
            unstructured_server_url: Some("https://public.shinkai.com/x-un".to_string()),
            embeddings_server_url: Some("http://127.0.0.1:11435".to_string()),
            first_device_needs_registration_code: Some("false".to_string()),
            initial_agent_urls: Some("http://127.0.0.1:11435".to_string()),
            initial_agent_names: Some(initial_agent_names),
            initial_agent_models: Some(initial_agent_models),
            initial_agent_api_keys: Some("".to_string()),
            starting_num_qr_devices: Some("0".to_string()),
            log_all: Some("1".to_string()),
            proxy_identity: Some("@@relayer_pub_01.arb-sep-shinkai".to_string()),
            rpc_url: Some("https://public.stackup.sh/api/v1/node/arbitrum-sepolia".to_string()),
        }
    }
}
