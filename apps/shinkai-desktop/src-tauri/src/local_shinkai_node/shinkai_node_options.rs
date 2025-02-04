use std::path::PathBuf;

use crate::hardware::{hardware_get_summary, RequirementsStatus};
use serde::{Deserialize, Serialize};

/// It matches ENV variables names from ShinkaiNode
#[derive(Serialize, Deserialize, Clone)]
pub struct ShinkaiNodeOptions {
    pub node_api_ip: Option<String>,
    pub node_api_port: Option<String>,
    pub node_ws_port: Option<String>,
    pub node_https_port: Option<String>,
    pub node_ip: Option<String>,
    pub node_port: Option<String>,
    pub global_identity_name: Option<String>,
    pub node_storage_path: Option<String>,
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
    pub default_embedding_model: Option<String>,
    pub supported_embedding_models: Option<String>,
    pub shinkai_tools_runner_deno_binary_path: Option<String>,
    pub shinkai_tools_runner_uv_binary_path: Option<String>,
    pub pdfium_dynamic_lib_path: Option<String>,
}

impl ShinkaiNodeOptions {
    pub fn with_app_options(
        app_resource_dir: PathBuf,
        app_data_dir: PathBuf,
    ) -> ShinkaiNodeOptions {
        let default_pdfium_dynamic_lib_path = if cfg!(target_os = "macos") {
            app_resource_dir.join("../Frameworks")
        } else {
            app_resource_dir.join("external-binaries/shinkai-node")
        }
        .to_string_lossy()
        .replace("\\\\?\\C", "C");
        let default_node_storage_path = app_data_dir
            .join("node_storage")
            .to_string_lossy()
            .to_string();
        log::debug!(
            "PDFium dynamic library path: {:?}",
            default_pdfium_dynamic_lib_path
        );
        log::debug!("Node storage path: {:?}", default_node_storage_path);
        ShinkaiNodeOptions {
            node_storage_path: Some(default_node_storage_path),
            pdfium_dynamic_lib_path: Some(default_pdfium_dynamic_lib_path),
            ..Default::default()
        }
    }

    pub fn default_initial_model() -> String {
        let hardware_summary = hardware_get_summary();
        log::info!("hardware summary: {:?}", hardware_summary);

        let model = if cfg!(target_os = "macos") && hardware_summary.hardware.memory >= 16 {
            "mistral-small:22b-instruct-2409-q4_1".to_string()
        } else if cfg!(target_os = "macos") {
            "command-r7b:7b-12-2024-q4_K_M".to_string()
        } else {
            match hardware_summary.requirements_status {
                RequirementsStatus::Minimum
                | RequirementsStatus::StillUsable
                | RequirementsStatus::Unmeet => "gemma2:2b-instruct-q4_1".to_string(),
                _ => "llama3.1:8b-instruct-q4_1".to_string(),
            }
        };
        log::info!("default initial model: {:?}", model);
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
                    .or(base_options.node_api_ip)
                    .unwrap_or_default(),
            ),
            node_api_port: Some(
                options
                    .node_api_port
                    .or(base_options.node_api_port)
                    .unwrap_or_default(),
            ),
            node_ws_port: Some(
                options
                    .node_ws_port
                    .or(base_options.node_ws_port)
                    .unwrap_or_default(),
            ),
            node_ip: Some(options.node_ip.or(base_options.node_ip).unwrap_or_default()),
            node_port: Some(
                options
                    .node_port
                    .or(base_options.node_port)
                    .unwrap_or_default(),
            ),
            node_https_port: Some(
                options
                    .node_https_port
                    .or(base_options.node_https_port)
                    .unwrap_or_default(),
            ),
            global_identity_name: Some(
                options
                    .global_identity_name
                    .or(base_options.global_identity_name)
                    .unwrap_or_default(),
            ),
            node_storage_path: Some(
                options
                    .node_storage_path
                    .or(base_options.node_storage_path)
                    .unwrap_or_default(),
            ),
            embeddings_server_url: Some(
                options
                    .embeddings_server_url
                    .or(base_options.embeddings_server_url)
                    .unwrap_or_default(),
            ),
            first_device_needs_registration_code: Some(
                options
                    .first_device_needs_registration_code
                    .or(base_options.first_device_needs_registration_code)
                    .unwrap_or_default(),
            ),
            initial_agent_names: Some(
                options
                    .initial_agent_names
                    .or(base_options.initial_agent_names)
                    .unwrap_or_default(),
            ),
            initial_agent_urls: Some(
                options
                    .initial_agent_urls
                    .or(base_options.initial_agent_urls)
                    .unwrap_or_default(),
            ),
            initial_agent_models: Some(
                options
                    .initial_agent_models
                    .or(base_options.initial_agent_models)
                    .unwrap_or_default(),
            ),
            initial_agent_api_keys: Some(
                options
                    .initial_agent_api_keys
                    .or(base_options.initial_agent_api_keys)
                    .unwrap_or_default(),
            ),
            starting_num_qr_devices: Some(
                options
                    .starting_num_qr_devices
                    .or(base_options.starting_num_qr_devices)
                    .unwrap_or_default(),
            ),
            log_all: Some(options.log_all.or(base_options.log_all).unwrap_or_default()),
            proxy_identity: Some(
                options
                    .proxy_identity
                    .or(base_options.proxy_identity)
                    .unwrap_or_default(),
            ),
            rpc_url: Some(options.rpc_url.or(base_options.rpc_url).unwrap_or_default()),
            default_embedding_model: Some(
                options
                    .default_embedding_model
                    .or(base_options.default_embedding_model)
                    .unwrap_or_default(),
            ),
            supported_embedding_models: Some(
                options
                    .supported_embedding_models
                    .or(base_options.supported_embedding_models)
                    .unwrap_or_default(),
            ),
            shinkai_tools_runner_deno_binary_path: Some(
                options
                    .shinkai_tools_runner_deno_binary_path
                    .or(base_options.shinkai_tools_runner_deno_binary_path)
                    .unwrap_or_default(),
            ),
            shinkai_tools_runner_uv_binary_path: Some(
                options
                    .shinkai_tools_runner_uv_binary_path
                    .or(base_options.shinkai_tools_runner_uv_binary_path)
                    .unwrap_or_default(),
            ),
            pdfium_dynamic_lib_path: Some(match options.pdfium_dynamic_lib_path {
                Some(ref path) if !path.is_empty() => path.clone(),
                _ => base_options.pdfium_dynamic_lib_path.unwrap_or_default(),
            }),
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

        let shinkai_tools_runner_deno_binary_path = std::env::current_exe()
            .unwrap()
            .parent()
            .unwrap()
            .join(if cfg!(target_os = "windows") {
                "deno.exe"
            } else {
                "deno"
            })
            .to_string_lossy()
            .to_string();

        let shinkai_tools_runner_uv_binary_path = std::env::current_exe()
            .unwrap()
            .parent()
            .unwrap()
            .join(if cfg!(target_os = "windows") {
                "uv.exe"
            } else {
                "uv"
            })
            .to_string_lossy()
            .to_string();

        ShinkaiNodeOptions {
            node_api_ip: Some("127.0.0.1".to_string()),
            node_api_port: Some("9550".to_string()),
            node_ws_port: Some("9551".to_string()),
            node_ip: Some("127.0.0.1".to_string()),
            node_port: Some("9552".to_string()),
            node_https_port: Some("9553".to_string()),
            global_identity_name: None,
            node_storage_path: Some("./".to_string()),
            embeddings_server_url: Some("http://127.0.0.1:11435".to_string()),
            first_device_needs_registration_code: Some("false".to_string()),
            initial_agent_urls: Some("http://127.0.0.1:11435".to_string()),
            initial_agent_names: Some(initial_agent_names),
            initial_agent_models: Some(initial_agent_models),
            initial_agent_api_keys: Some("".to_string()),
            starting_num_qr_devices: Some("0".to_string()),
            log_all: Some("1".to_string()),
            proxy_identity: None,
            rpc_url: Some("https://sepolia.base.org".to_string()),
            default_embedding_model: Some("snowflake-arctic-embed:xs".to_string()),
            supported_embedding_models: Some("snowflake-arctic-embed:xs".to_string()),
            shinkai_tools_runner_deno_binary_path: Some(shinkai_tools_runner_deno_binary_path),
            shinkai_tools_runner_uv_binary_path: Some(shinkai_tools_runner_uv_binary_path),
            pdfium_dynamic_lib_path: None,
        }
    }
}
