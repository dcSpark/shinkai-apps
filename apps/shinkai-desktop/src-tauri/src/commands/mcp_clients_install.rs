use serde_json::{json, Value};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use crate::local_shinkai_node::process_handlers::process_utils::kill_process_by_name;

// --- Error Types ---
#[derive(Debug)]
pub enum ClaudeIntegrationError {
    ConfigNotFound(String),
    InvalidJson(String),
    NoMcpServers,
    NoServerConfig,
    UnsupportedOS(String),
    IoError(std::io::Error),
}

impl std::fmt::Display for ClaudeIntegrationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ClaudeIntegrationError::ConfigNotFound(path) => {
                write!(f, "Claude configuration file not found at {}", path)
            }
            ClaudeIntegrationError::InvalidJson(err) => {
                write!(f, "Invalid JSON configuration: {}", err)
            }
            ClaudeIntegrationError::NoMcpServers => {
                write!(f, "No mcpServers found in Claude configuration")
            }
            ClaudeIntegrationError::NoServerConfig => {
                write!(f, "Your server is not configured in Claude")
            }
            ClaudeIntegrationError::UnsupportedOS(os) => {
                write!(f, "Unsupported operating system: {}", os)
            }
            ClaudeIntegrationError::IoError(err) => write!(f, "IO Error: {}", err),
        }
    }
}

impl std::error::Error for ClaudeIntegrationError {}

impl From<std::io::Error> for ClaudeIntegrationError {
    fn from(err: std::io::Error) -> Self {
        ClaudeIntegrationError::IoError(err)
    }
}

impl From<serde_json::Error> for ClaudeIntegrationError {
    fn from(err: serde_json::Error) -> Self {
        ClaudeIntegrationError::InvalidJson(err.to_string())
    }
}

// --- Path Resolution ---
pub fn get_claude_config_path() -> Result<PathBuf, ClaudeIntegrationError> {
    match env::consts::OS {
        "windows" => {
            let appdata = env::var("APPDATA").map_err(|_| {
                ClaudeIntegrationError::IoError(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "APPDATA environment variable not found",
                ))
            })?;
            Ok(PathBuf::from(format!(
                "{}\\Claude\\claude_desktop_config.json",
                appdata
            )))
        }
        "macos" => {
            let home = env::var("HOME").map_err(|_| {
                ClaudeIntegrationError::IoError(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "HOME environment variable not found",
                ))
            })?;
            Ok(PathBuf::from(format!(
                "{}/Library/Application Support/Claude/claude_desktop_config.json",
                home
            )))
        }
        "linux" => {
            let home = env::var("HOME").map_err(|_| {
                ClaudeIntegrationError::IoError(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "HOME environment variable not found",
                ))
            })?;
            Ok(PathBuf::from(format!(
                "{}/.config/Claude/claude_desktop_config.json",
                home
            )))
        }
        os => Err(ClaudeIntegrationError::UnsupportedOS(os.to_string())),
    }
}

pub fn backup_claude_config(config_path: &PathBuf) -> Result<PathBuf, ClaudeIntegrationError> {
    if !config_path.exists() {
        // No need to backup if it doesn't exist
        return Ok(config_path.clone());
    }

    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?
        .as_secs();

    let backup_path = config_path.with_extension(format!("json.backup_{}", timestamp));
    fs::copy(config_path, &backup_path)?;

    log::info!(
        "Created backup of Claude config at: {}",
        backup_path.display()
    );
    Ok(backup_path)
}

// --- Core Integration Functions ---

/// Checks if Claude is installed on the system
pub fn is_claude_installed() -> Result<bool, ClaudeIntegrationError> {
    let config_path = get_claude_config_path()?;
    Ok(config_path.exists())
}

/// Kills any running Claude process using the utility function
async fn kill_claude_process(app: &AppHandle) -> Result<(), String> { // Made async and takes AppHandle
    let process_name = "Claude";
    log::info!("Attempting to kill process by name: {}", process_name);
    kill_process_by_name(app.clone(), process_name).await;
    Ok(())
}

/// Checks if your MCP server is configured in Claude
pub fn is_server_configured_in_claude(server_id: &str) -> Result<bool, ClaudeIntegrationError> {
    let config_path = get_claude_config_path()?;

    // Check if the config file exists
    if !config_path.exists() {
        return Ok(false); // Not installed, therefore not configured
    }

    // Read and parse the config file
    let content = fs::read_to_string(&config_path)?;
    // Handle empty file case
    let parsed: Value = if content.trim().is_empty() {
        json!({})
    } else {
        serde_json::from_str(&content)?
    };

    // Check for mcpServers section and our server entry
    if let Some(servers) = parsed.get("mcpServers") {
        if servers.get(server_id).is_some() {
            log::info!("✅ Server '{}' is configured in Claude", server_id);
            return Ok(true);
        }
    }

    log::info!("❌ Server '{}' is not configured in Claude", server_id);
    Ok(false)
}

/// Adds your MCP server to Claude's configuration
pub async fn configure_server_in_claude(
    app: AppHandle,
    server_id: &str,
    server_binary_path: &str,
    server_args: Vec<String>,
) -> Result<(), ClaudeIntegrationError> {
    // Check if already configured
    if is_server_configured_in_claude(server_id)? {
        log::info!("Server '{}' is already configured in Claude", server_id);
        return Ok(());
    }

    let config_path = get_claude_config_path()?;

    // Kill any running Claude process
    log::info!("Attempting to terminate any running Claude processes...");
    kill_claude_process(&app).await.map_err(|e| {
        // Log the error but continue, as failing to kill isn't necessarily fatal for config update
        log::warn!("Failed attempt to kill Claude process: {}. Continuing with configuration...", e);
        // Convert the error to the expected type if needed, or handle appropriately.
        // For now, let's proceed, but ideally, the error types might need alignment.
        // We map the error here just to satisfy the type checker if kill_claude_process returns its own error.
        // If kill_process_by_name logs but doesn't return Result, this map_err might be simpler.
        ClaudeIntegrationError::IoError(std::io::Error::new(std::io::ErrorKind::Other, e)) 
    })?;

    // Create backup of existing config
    if config_path.exists() {
        backup_claude_config(&config_path)?;
    } else {
        // Ensure parent directory exists if config doesn't exist
        if let Some(parent) = config_path.parent() {
            fs::create_dir_all(parent)?;
        }
    }

    // Read existing config or create new one
    let mut config: Value = if config_path.exists() {
        let content = fs::read_to_string(&config_path)?;
        if content.trim().is_empty() {
            // If file exists but is empty, start with an empty JSON object
            json!({})
        } else {
            serde_json::from_str(&content)?
        }
    } else {
        // If file doesn't exist, start with an empty JSON object
        json!({})
    };

    // Ensure mcpServers section exists and is an object
    if !config.get("mcpServers").map_or(false, |v| v.is_object()) {
        config["mcpServers"] = json!({});
    }

    // Add server configuration
    config["mcpServers"][server_id] = json!({
        "args": server_args,
        "command": server_binary_path
    });

    // Write the updated configuration
    fs::write(&config_path, serde_json::to_string_pretty(&config)?)?;

    log::info!("✅ Server '{}' successfully configured in Claude", server_id);
    log::info!("Configuration written to: {}", config_path.display());
    log::info!("You may need to restart Claude for the changes to take full effect.");

    Ok(())
}

/// Generates sample configuration for users who prefer manual setup
pub fn get_claude_config_instructions(
    server_id: &str,
    binary_path: &str,
    server_args: &Vec<String>, // Accept args as input
) -> String {
    let config_path_result = get_claude_config_path();
    let config_path_display = config_path_result
        .as_ref()
        .map(|p| p.display().to_string())
        .unwrap_or_else(|_| "<Claude config path could not be determined>".to_string());

    let config_example = json!({
        "mcpServers": {
            server_id: {
                "args": server_args, // Use provided args
                "command": binary_path
            }
        }
    });

    // Attempt to format the JSON nicely, handle potential errors
    let pretty_json_result = serde_json::to_string_pretty(&config_example);
    let pretty_json =
        pretty_json_result.unwrap_or_else(|_| "{\"error\": \"Could not generate JSON example\"}".to_string());
    format!(
        r#"
# Claude Integration Instructions

1.  **Ensure Claude is not running.**
2.  Locate or create the Claude configuration file. The typical location is:
    `{config_path_display}`
3.  Open the file in a text editor.
4.  **If the file exists and contains JSON**, carefully merge the following `mcpServers` configuration. Ensure you place `{server_id}` correctly within the existing `mcpServers` object if it exists. Create the `mcpServers` object if it doesn't.
    **If the file is empty or does not exist**, paste the entire content below:

```json
{pretty_json}
```

5.  Save the file.
6.  Start Claude. Your Shinkai server should now be available.

**Note:** If you encounter issues, please ensure the JSON structure is valid after merging. You might need to add a comma (`,`) if adding this server entry after another existing entry within `mcpServers`.
"#,
        config_path_display = config_path_display,
        server_id = server_id,
        pretty_json = pretty_json
    )
}


// --- Tauri Commands ---

#[tauri::command]
pub async fn check_claude_installed() -> Result<bool, String> {
    is_claude_installed().map_err(|e| {
        log::error!("Error checking Claude installation: {}", e);
        e.to_string()
    })
}

#[tauri::command]
pub async fn is_server_registered_in_claude(server_id: String) -> Result<bool, String> {
    is_server_configured_in_claude(&server_id).map_err(|e| {
        log::error!("Error checking if server '{}' is configured in Claude: {}", server_id, e);
        e.to_string()
    })
}

#[tauri::command]
pub async fn register_server_in_claude(
    app: tauri::AppHandle,
    server_id: String,
    binary_path: String,
    server_args: Vec<String>, // Receive args from frontend
) -> Result<(), String> {
    log::info!("Attempting to register server '{}' with binary '{}' and args {:?}", server_id, binary_path, server_args);
    configure_server_in_claude(app, &server_id, &binary_path, server_args)
        .await
        .map_err(|e| {
            log::error!("Error configuring server '{}' in Claude: {}", server_id, e);
            e.to_string()
        })
}

#[tauri::command]
pub async fn get_claude_config_help(
    server_id: String,
    binary_path: String,
    server_args: Vec<String>, // Receive args from frontend
) -> Result<String, String> {
    log::debug!("Generating Claude config help for server '{}', binary '{}', args {:?}", server_id, binary_path, server_args);
    // Pass the server_args to the instruction generation function
    Ok(get_claude_config_instructions(&server_id, &binary_path, &server_args))
}
