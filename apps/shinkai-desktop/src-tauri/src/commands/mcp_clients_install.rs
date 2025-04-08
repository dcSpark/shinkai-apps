use serde_json::{json, Value};
use std::env;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::AppHandle;
use crate::local_shinkai_node::process_handlers::process_utils::kill_process_by_name;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;

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
4.  In case of using an npx command to run the MCP ensure that you have Node.js installed in your machine.
5.  **If the file exists and contains JSON**, carefully merge the following `mcpServers` configuration. Ensure you place `{server_id}` correctly within the existing `mcpServers` object if it exists. Create the `mcpServers` object if it doesn't.
    **If the file is empty or does not exist**, paste the entire content below:

```json
{pretty_json}
```

6.  Save the file.
7.  Start Claude. Your Shinkai server should now be available.

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

// --- Cursor Integration --- //

// --- Cursor Error Types ---
#[derive(Debug)]
pub enum CursorIntegrationError {
    ConfigNotFound(String),
    InvalidJson(String),
    NoMcpServers,
    IoError(std::io::Error),
}

impl std::fmt::Display for CursorIntegrationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            CursorIntegrationError::ConfigNotFound(path) => {
                write!(f, "Cursor configuration file not found at {}", path)
            }
            CursorIntegrationError::InvalidJson(err) => {
                write!(f, "Invalid JSON configuration: {}", err)
            }
            CursorIntegrationError::NoMcpServers => {
                write!(f, "No mcpServers found in Cursor configuration")
            }
            CursorIntegrationError::IoError(err) => write!(f, "IO Error: {}", err),
        }
    }
}

impl std::error::Error for CursorIntegrationError {}

impl From<std::io::Error> for CursorIntegrationError {
    fn from(err: std::io::Error) -> Self {
        CursorIntegrationError::IoError(err)
    }
}

// Need to implement From<serde_json::Error> for CursorIntegrationError as well
impl From<serde_json::Error> for CursorIntegrationError {
    fn from(err: serde_json::Error) -> Self {
        CursorIntegrationError::InvalidJson(err.to_string())
    }
}

// --- Cursor Data Models ---
#[derive(Serialize, Deserialize, Clone, Debug)]
struct CursorMcpConfig {
    #[serde(rename = "mcpServers")]
    pub mcp_servers: Option<HashMap<String, McpServer>>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(tag = "type", rename_all = "lowercase")]
enum McpServer {
    Command(CommandMcpServer),
    Sse(SseMcpServer),
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct CommandMcpServer {
    pub command: String,
    pub args: Vec<String>,
    pub env: Option<HashMap<String, String>>,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
struct SseMcpServer {
    pub url: String,
    pub env: Option<HashMap<String, String>>,
}

// --- Cursor Path Resolution ---
fn get_cursor_config_path() -> Result<PathBuf, CursorIntegrationError> {
    match env::consts::OS {
        "windows" => {
            // On Windows, Cursor config *might* be in APPDATA, but often it's directly in the user profile.
            // Let's prioritize the user profile path (~/.cursor) but use APPDATA as a fallback concept if needed.
            // However, the guide explicitly states ~/.cursor/mcp.json is used on all platforms.
            // So, we will stick to using the HOME equivalent for Windows as well.
            let home = env::var("USERPROFILE").map_err(|_| {
                CursorIntegrationError::IoError(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "USERPROFILE environment variable not found",
                ))
            })?;
            let config_path = PathBuf::from(home).join(".cursor/mcp.json");
            log::info!("Cursor MCP config path (Windows): {}", config_path.display());
            Ok(config_path)
        }
        "macos" | "linux" => {
            let home = env::var("HOME").map_err(|_| {
                CursorIntegrationError::IoError(std::io::Error::new(
                    std::io::ErrorKind::NotFound,
                    "HOME environment variable not found",
                ))
            })?;
            let config_path = PathBuf::from(home).join(".cursor/mcp.json");
            log::info!("Cursor MCP config path (Unix): {}", config_path.display());
            Ok(config_path)
        }
        os => {
             // Add error for unsupported OS
             let err_msg = format!("Unsupported operating system for Cursor config path: {}", os);
             log::error!("{}", err_msg);
             Err(CursorIntegrationError::IoError(std::io::Error::new(
                 std::io::ErrorKind::Unsupported,
                 err_msg,
            )))
        }
    }
}

fn backup_cursor_config(config_path: &PathBuf) -> Result<PathBuf, CursorIntegrationError> {
    if !config_path.exists() {
        return Ok(config_path.clone());
    }
    let timestamp = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?
        .as_secs();
    let backup_path = config_path.with_extension(format!("json.backup_{}", timestamp));
    std::fs::copy(config_path, &backup_path)?;
    log::info!(
        "Created backup of Cursor config at: {}",
        backup_path.display()
    );
    Ok(backup_path)
}

// --- Cursor Core Integration Functions ---
pub fn is_cursor_installed() -> Result<bool, CursorIntegrationError> {
    let config_path = get_cursor_config_path()?;
    // Check if the directory exists as a proxy for installation
    Ok(config_path.parent().map_or(false, |p| p.exists()))
}

pub fn is_server_configured_in_cursor(server_id: &str) -> Result<bool, CursorIntegrationError> {
    let config_path = get_cursor_config_path()?;
    if !config_path.exists() {
        log::info!("Cursor config file not found at {}, server cannot be configured.", config_path.display());
        return Ok(false);
    }
    
    let config_content = match fs::read_to_string(&config_path) {
        Ok(content) => content,
        Err(e) => {
            log::error!("Failed to read Cursor config file at {}: {}. Assuming server not configured.", config_path.display(), e);
            // Propagate IO error
            return Err(CursorIntegrationError::IoError(e)); 
        }
    };
    
    if config_content.trim().is_empty() {
        log::info!("Cursor config file is empty. Server '{}' is not configured.", server_id);
        return Ok(false);
    }

    // Parse leniently into a generic Value first
    match serde_json::from_str::<Value>(&config_content) {
        Ok(parsed_value) => {
            // Check if mcpServers key exists and is an object
            if let Some(servers_value) = parsed_value.get("mcpServers") {
                if let Some(servers_map) = servers_value.as_object() {
                    // Simply check if the key exists in the map
                    let is_configured = servers_map.contains_key(server_id);
                    if is_configured {
                        log::info!("✅ Server '{}' key found in Cursor config.", server_id);
                    } else {
                        log::info!("❌ Server '{}' key not found in Cursor config.", server_id);
                    }
                    Ok(is_configured)
                } else {
                    log::warn!("'mcpServers' key found in Cursor config, but it is not a JSON object. Assuming server '{}' not configured.", server_id);
                    Ok(false)
                }
            } else {
                log::info!("'mcpServers' key not found in Cursor config. Server '{}' is not configured.", server_id);
                Ok(false)
            }
        }
        Err(e) => {
            // Log error if the entire JSON is invalid, but treat as "not configured" for the check
            log::error!(
                "Cursor config file at {} is invalid JSON. Assuming server '{}' not configured. Error: {}",
                config_path.display(),
                server_id,
                e
            );
             // Propagate JSON error
            Err(CursorIntegrationError::InvalidJson(e.to_string()))
        }
    }
}

pub enum ServerConfigType {
    Command {
        binary_path: String,
        args: Vec<String>,
        env: Option<HashMap<String, String>>,
    },
    SSE {
        url: String,
        env: Option<HashMap<String, String>>,
    },
}

pub fn configure_server_in_cursor(
    server_id: &str,
    config_type: ServerConfigType,
) -> Result<(), CursorIntegrationError> {
    // Check if already configured (using the robust check)
    if is_server_configured_in_cursor(server_id)? {
        log::info!("Server '{}' is already configured in Cursor", server_id);
        return Ok(());
    }
    
    let config_path = get_cursor_config_path()?;
    
    // Ensure parent directory exists
    if let Some(parent) = config_path.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)?;
            log::info!("Created directory: {}", parent.display());
        }
    }
    
    // Backup existing config if it exists
    if config_path.exists() {
        backup_cursor_config(&config_path)?;
    }

    // Read existing config content
    let existing_content = if config_path.exists() {
        fs::read_to_string(&config_path)?
    } else {
        String::new() // Start with empty if file doesn't exist
    };

    // Parse existing content more leniently
    let mut existing_servers: HashMap<String, McpServer> = HashMap::new();
    if !existing_content.trim().is_empty() {
        match serde_json::from_str::<Value>(&existing_content) {
            Ok(parsed_value) => {
                if let Some(servers_value) = parsed_value.get("mcpServers") {
                    if let Some(servers_map) = servers_value.as_object() {
                        for (key, server_value) in servers_map {
                            // Attempt to deserialize each server individually
                            match serde_json::from_value::<McpServer>(server_value.clone()) {
                                Ok(server) => {
                                    existing_servers.insert(key.clone(), server);
                                }
                                Err(e) => {
                                    // Log warning for invalid entries but don't fail
                                    log::warn!(
                                        "Skipping invalid server entry '{}' in Cursor config: {}. Error: {}",
                                        key,
                                        server_value,
                                        e
                                    );
                                }
                            }
                        }
                    }
                }
            }
            Err(e) => {
                // Handle case where the entire existing JSON is invalid
                log::error!(
                    "Existing Cursor config file at {} is invalid JSON and will be overwritten. Error: {}",
                    config_path.display(),
                    e
                );
                // Proceed with an empty map, effectively overwriting the invalid file
                existing_servers.clear(); 
            }
        }
    }

    // Add or update our server configuration
    match config_type {
        ServerConfigType::Command { binary_path, args, env } => {
            existing_servers.insert(
                server_id.to_string(),
                McpServer::Command(CommandMcpServer {
                    command: binary_path,
                    args,
                    env,
                }),
            );
            log::info!("Adding/Updating Cursor Command-based server configuration for '{}'", server_id);
        }
        ServerConfigType::SSE { url, env } => {
            existing_servers.insert(
                server_id.to_string(),
                McpServer::Sse(SseMcpServer {
                    url,
                    env,
                }),
            );
            log::info!("Adding/Updating Cursor SSE-based server configuration for '{}'", server_id);
        }
    }
    
    // Construct the final config object
    let final_config = CursorMcpConfig {
        mcp_servers: Some(existing_servers),
    };

    // Write the updated configuration
    std::fs::write(
        &config_path,
        serde_json::to_string_pretty(&final_config)?,
    )?;
    
    log::info!("✅ Successfully configured server '{}' in Cursor", server_id);
    log::info!("Configuration written to: {}", config_path.display());
    log::info!("Please restart Cursor for the changes to take effect.");
    
    Ok(())
}

// --- Cursor Config Helpers ---
pub mod cursor_config_helpers {
    use super::*;
    pub fn configure_command_server(
        server_id: &str,
        binary_path: &str,
        args: Vec<String>,
        env: Option<HashMap<String, String>>,
    ) -> Result<(), CursorIntegrationError> {
        configure_server_in_cursor(
            server_id,
            ServerConfigType::Command {
                binary_path: binary_path.to_string(),
                args,
                env,
            },
        )
    }
    pub fn configure_sse_server(
        server_id: &str,
        url: &str,
        env: Option<HashMap<String, String>>,
    ) -> Result<(), CursorIntegrationError> {
        configure_server_in_cursor(
            server_id,
            ServerConfigType::SSE {
                url: url.to_string(),
                env,
            },
        )
    }
}

// --- Cursor Manual Instructions ---
pub fn get_cursor_command_config_instructions(
    server_id: &str,
    binary_path: &str,
    args: &[String],
    env: Option<&HashMap<String, String>>,
) -> Result<String, CursorIntegrationError> {
    let config_path_res = get_cursor_config_path();
    let config_path_display = config_path_res.as_ref().map(|p| p.display().to_string()).unwrap_or_else(|_| "<Cursor config path could not be determined>".to_string());

    let command_server = CommandMcpServer {
        command: binary_path.to_string(),
        args: args.to_vec(),
        env: env.cloned(),
    };
    let mut servers = HashMap::new();
    servers.insert(server_id.to_string(), McpServer::Command(command_server));
    let sample_config = CursorMcpConfig { mcp_servers: Some(servers) };
    let pretty_json = serde_json::to_string_pretty(&sample_config)?;

    Ok(format!(
        r#"
# Cursor Integration Instructions (Command-based)

1.  **Close Cursor** if it's running.
2.  Open or create the configuration file at:
    `{config_path_display}`
3.  **If the file exists and has content**, carefully merge the following JSON structure into the existing `mcpServers` object. Create the `mcpServers` object if it doesn't exist.
    **If the file is empty or does not exist**, paste the entire content below:

```json
{pretty_json}
```

4.  Save the file.
5.  **Restart Cursor**. Your Shinkai server should now be available.

**Note:** Ensure the final JSON is valid. You might need to add a comma (`,`) if adding this server after another entry in `mcpServers`.
"#,
        config_path_display = config_path_display,
        pretty_json = pretty_json
    ))
}

pub fn get_cursor_sse_config_instructions(
    server_id: &str,
    url: &str,
    env: Option<&HashMap<String, String>>,
) -> Result<String, CursorIntegrationError> {
    let config_path_res = get_cursor_config_path();
    let config_path_display = config_path_res.as_ref().map(|p| p.display().to_string()).unwrap_or_else(|_| "<Cursor config path could not be determined>".to_string());

    let sse_server = SseMcpServer {
        url: url.to_string(),
        env: env.cloned(),
    };
    let mut servers = HashMap::new();
    servers.insert(server_id.to_string(), McpServer::Sse(sse_server));
    let sample_config = CursorMcpConfig { mcp_servers: Some(servers) };
    let pretty_json = serde_json::to_string_pretty(&sample_config)?;

    Ok(format!(
        r#"
# Cursor Integration Instructions (SSE-based)

1.  **Close Cursor** if it's running.
2.  Open or create the configuration file at:
    `{config_path_display}`
3.  **If the file exists and has content**, carefully merge the following JSON structure into the existing `mcpServers` object. Create the `mcpServers` object if it doesn't exist.
    **If the file is empty or does not exist**, paste the entire content below:

```json
{pretty_json}
```

4.  Save the file.
5.  **Restart Cursor**. Your Shinkai server should now be available via SSE.

**Note:** Ensure the final JSON is valid. You might need to add a comma (`,`) if adding this server after another entry in `mcpServers`.
"#,
        config_path_display = config_path_display,
        pretty_json = pretty_json
    ))
}

// --- Cursor Tauri Commands ---

#[tauri::command]
pub async fn check_cursor_installed() -> Result<bool, String> {
    is_cursor_installed().map_err(|e| {
        log::error!("Error checking Cursor installation: {}", e);
        e.to_string()
    })
}

#[tauri::command]
pub async fn is_server_registered_in_cursor(server_id: String) -> Result<bool, String> {
    is_server_configured_in_cursor(&server_id).map_err(|e| {
        log::error!(
            "Error checking if server '{}' is configured in Cursor: {}",
            server_id,
            e
        );
        e.to_string()
    })
}

#[tauri::command]
pub async fn register_command_server_in_cursor(
    server_id: String,
    binary_path: String,
    args: Vec<String>,
    env: Option<HashMap<String, String>>,
) -> Result<(), String> {
    log::info!(
        "Attempting to register COMMAND server '{}' in Cursor with binary '{}' and args {:?}",
        server_id,
        binary_path,
        args
    );
    cursor_config_helpers::configure_command_server(&server_id, &binary_path, args, env).map_err(|e| {
        log::error!("Error configuring COMMAND server '{}' in Cursor: {}", server_id, e);
        e.to_string()
    })
}

#[tauri::command]
pub async fn register_sse_server_in_cursor(
    server_id: String,
    url: String,
    env: Option<HashMap<String, String>>,
) -> Result<(), String> {
    log::info!(
        "Attempting to register SSE server '{}' in Cursor with URL '{}'",
        server_id,
        url
    );
    cursor_config_helpers::configure_sse_server(&server_id, &url, env).map_err(|e| {
        log::error!("Error configuring SSE server '{}' in Cursor: {}", server_id, e);
        e.to_string()
    })
}

#[tauri::command]
pub async fn get_cursor_command_config_help(
    server_id: String,
    binary_path: String,
    args: Vec<String>,
    // Note: Env is omitted for simplicity in help, but could be added
) -> Result<String, String> {
    log::debug!(
        "Generating Cursor COMMAND config help for server '{}', binary '{}', args {:?}",
        server_id,
        binary_path,
        args
    );
    get_cursor_command_config_instructions(&server_id, &binary_path, &args, None).map_err(|e| {
        log::error!(
            "Error generating Cursor COMMAND config help for server '{}': {}",
            server_id,
            e
        );
        e.to_string()
    })
}

#[tauri::command]
pub async fn get_cursor_sse_config_help(
    server_id: String,
    url: String,
    // Note: Env is omitted for simplicity in help, but could be added
) -> Result<String, String> {
    log::debug!(
        "Generating Cursor SSE config help for server '{}', URL '{}'",
        server_id,
        url
    );
    get_cursor_sse_config_instructions(&server_id, &url, None).map_err(|e| {
        log::error!(
            "Error generating Cursor SSE config help for server '{}': {}",
            server_id,
            e
        );
        e.to_string()
    })
}
