use std::fs;
use std::fs::File;
use std::io::Read;
use std::io::Write;
use std::os::unix::fs::PermissionsExt;
use std::sync::OnceLock;

use futures_util::SinkExt;
use futures_util::StreamExt;
use tokio::net::{TcpListener, TcpStream};

use base64::engine::general_purpose::STANDARD;
use base64::prelude::*;

use crate::ws_server::ws_message::WSChannel;
use crate::ws_server::ws_message::WSMessage;
use crate::ws_server::ws_message::WSTauriAction;

static DOWNLOADS_PATH: OnceLock<std::path::PathBuf> = OnceLock::new();

pub async fn ws_start_server() {
    ensure_downloads_folder_exists();

    // TODO: make this configurable
    let addr = "127.0.0.1:9555".to_string();

    // Create the event loop and TCP listener we'll accept connections on.
    let try_socket = TcpListener::bind(&addr).await;
    let listener = try_socket.expect("Failed to bind");

    println!("WebSocket server successfully initiated at {}", addr);

    while let Ok((stream, _)) = listener.accept().await {
        tokio::spawn(accept_connection(stream));
    }
}

fn ensure_downloads_folder_exists() {
    let downloads_path = dirs::home_dir().unwrap().join("tauri_playground");
    DOWNLOADS_PATH.set(downloads_path.clone()).unwrap();

    if !downloads_path.exists() {
        if let Err(e) = fs::create_dir_all(&downloads_path) {
            eprintln!(
                "Error creating directory {}: {}",
                downloads_path.display(),
                e
            );
        } else {
            println!("Created directory: {}", downloads_path.display());
        }
    }
}

async fn accept_connection(stream: TcpStream) {
    // Upgrade the TCP stream to a WebSocket stream
    let ws_stream = tokio_tungstenite::accept_async(stream)
        .await
        .expect("Error during the websocket handshake occurred");

    // Split the WebSocket stream into a writer (sink) and a reader (stream)
    let (mut write, mut read) = ws_stream.split();

    // Continuously read messages from the WebSocket
    while let Some(message) = read.next().await {
        match message {
            Ok(msg) => {
                // Log the received message
                println!("Received: {}", msg);

                // Check if the message is empty
                if msg.to_string().trim().is_empty() {
                    eprintln!("Received an empty message");
                    continue;
                }

                // Deserialize the message into WSTauriMessage
                let ws_message: WSMessage = match serde_json::from_str(&msg.to_string()) {
                    Ok(msg) => msg,
                    Err(e) => {
                        eprintln!("Error deserializing message: {}", e);
                        continue;
                    }
                };

                // Log the channel information
                println!("Message sent to channel: {:?}", ws_message.channel);

                match ws_message.channel {
                    WSChannel::Actions => match ws_message.action {
                        WSTauriAction::ReadFolder(_) => {
                            eprintln!("Reading downloads folder");
                            let files = read_downloads_folder();
                            if let Err(e) = write
                                .send(tokio_tungstenite::tungstenite::Message::Text(files))
                                .await
                            {
                                eprintln!("Error sending message: {}", e);
                            }
                        }
                        WSTauriAction::ReadFile(file_name) => {
                            eprintln!("Reading file: {}", file_name);
                            let file_content = read_file_content(&file_name);
                            if let Err(e) = write
                                .send(tokio_tungstenite::tungstenite::Message::Text(file_content))
                                .await
                            {
                                eprintln!("Error sending message: {}", e);
                            }
                        }
                        WSTauriAction::WriteFile(content) => {
                            eprintln!("Writing file: {}", content.destination);
                            let result = write_file_content(&content.destination, &content.content);
                            if let Err(e) = write
                                .send(tokio_tungstenite::tungstenite::Message::Text(result))
                                .await
                            {
                                eprintln!("Error sending message: {}", e);
                            }
                        }
                        WSTauriAction::FindFilesByName(criteria) => {
                            eprintln!(
                                "Finding files by name: {} with extension {}",
                                criteria.partial_file_name, criteria.extension_name
                            );
                            let result = find_files_by_name(
                                &criteria.partial_file_name,
                                &criteria.extension_name,
                            );
                            if let Err(e) = write
                                .send(tokio_tungstenite::tungstenite::Message::Text(result))
                                .await
                            {
                                eprintln!("Error sending message: {}", e);
                            }
                        }
                    },
                    // Handle other channels as needed
                }
            }
            Err(e) => {
                // Log any errors that occur while receiving messages
                eprintln!("Error receiving message: {}", e);
                break;
            }
        }
    }
}

fn read_downloads_folder() -> String {
    let downloads_path = DOWNLOADS_PATH.get().unwrap();
    match fs::read_dir(downloads_path) {
        Ok(entries) => {
            let files: Vec<serde_json::Value> = entries
              .filter_map(|entry| entry.ok())
              .map(|entry| {
                  let path = entry.path();
                  let metadata = fs::metadata(&path).unwrap();
                  let file_type = if metadata.is_dir() {
                      "directory"
                  } else {
                      "file"
                  };
                  serde_json::json!({
                      "path": path.display().to_string(),
                      "file_name": entry.file_name().into_string().unwrap_or_default(),
                      "file_type": file_type,
                      "size": metadata.len(),
                      "permissions": format!("{:o}", metadata.permissions().mode()),
                      "modified": metadata.modified().unwrap().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs()
                  })
              })
              .collect();
            println!("Files read from {}: {:?}", downloads_path.display(), files);
            serde_json::to_string(&files).unwrap_or_else(|_| "[]".to_string())
        }
        Err(e) => {
            eprintln!(
                "Error reading directory {}: {}",
                downloads_path.display(),
                e
            );
            "[]".to_string()
        }
    }
}

fn read_file_content(file_name: &str) -> String {
    let downloads_path = DOWNLOADS_PATH.get().unwrap().join(file_name);

    // Check if the file exists
    if !downloads_path.exists() {
        eprintln!("File does not exist: {}", downloads_path.display());
        return serde_json::json!({ "status": "error", "message": "File does not exist" })
            .to_string();
    }

    let mut file = match File::open(&downloads_path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Error opening file {}: {}", downloads_path.display(), e);
            return serde_json::json!({ "status": "error", "message": "Error opening file" })
                .to_string();
        }
    };

    let mut content = Vec::new();
    if let Err(e) = file.read_to_end(&mut content) {
        eprintln!("Error reading file {}: {}", downloads_path.display(), e);
        return serde_json::json!({ "status": "error", "message": "Error reading file" })
            .to_string();
    }

    // Encode the binary content to base64
    let encoded_content = STANDARD.encode(content);
    serde_json::json!({ "status": "success", "data": encoded_content }).to_string()
}

fn write_file_content(destination: &str, content: &str) -> String {
    let mut destination_path = destination.to_string();
    if destination_path.starts_with("~/") {
        destination_path = destination_path.replacen("~", ".", 1);
    } else if destination_path.starts_with("/") {
        destination_path = format!(".{}", destination_path);
    }

    let downloads_path = DOWNLOADS_PATH.get().unwrap().join(destination_path);

    eprintln!("Writing file to: {}", downloads_path.display());

    // Print the first 20 characters of the content
    eprintln!(
        "First 20 characters of content: {}",
        &content.chars().take(20).collect::<String>()
    );

    let decoded_content = match STANDARD.decode(content) {
        Ok(decoded) => decoded,
        Err(e) => {
            eprintln!("Error decoding base64 content: {}", e);
            return serde_json::json!({ "status": "error", "message": "Error decoding base64 content" }).to_string();
        }
    };
    eprintln!("Decoded content: {:?}", decoded_content);

    let mut file = match File::create(&downloads_path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Error creating file {}: {}", downloads_path.display(), e);
            return serde_json::json!({ "status": "error", "message": "Error creating file" })
                .to_string();
        }
    };
    eprintln!("Writing to file: {:?}", downloads_path.display());

    if let Err(e) = file.write_all(&decoded_content) {
        eprintln!("Error writing to file {}: {}", downloads_path.display(), e);
        return serde_json::json!({ "status": "error", "message": "Error writing to file" })
            .to_string();
    }

    serde_json::json!({ "status": "success", "message": "File written successfully" }).to_string()
}

fn find_files_by_name(partial_name: &str, extension: &str) -> String {
    let downloads_path = DOWNLOADS_PATH.get().unwrap();
    let mut results = Vec::new();

    fn search_dir(
        base_path: &std::path::Path,
        dir: &std::path::Path,
        partial_name: &str,
        extension: &str,
        results: &mut Vec<serde_json::Value>,
    ) {
        if let Ok(entries) = fs::read_dir(dir) {
            for entry in entries.filter_map(|entry| entry.ok()) {
                let path = entry.path();
                if path.is_dir() {
                    search_dir(base_path, &path, partial_name, extension, results);
                } else if let Some(file_name) = path.file_name().and_then(|n| n.to_str()) {
                    let matches_partial_name = file_name.contains(partial_name);
                    let matches_extension = extension.is_empty()
                        || path.extension().and_then(|ext| ext.to_str()) == Some(extension);

                    if matches_partial_name && matches_extension {
                        let relative_path = path
                            .strip_prefix(base_path)
                            .unwrap()
                            .to_string_lossy()
                            .to_string();
                        let metadata = fs::metadata(&path).unwrap();
                        let file_type = if metadata.is_dir() {
                            "directory"
                        } else {
                            "file"
                        };
                        results.push(serde_json::json!({
                            "path": relative_path,
                            "file_name": file_name.to_string(),
                            "file_type": file_type,
                            "size": metadata.len(),
                            "permissions": format!("{:o}", metadata.permissions().mode()),
                            "modified": metadata.modified().unwrap().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs()
                        }));
                    }
                }
            }
        }
    }

    search_dir(
        downloads_path,
        downloads_path,
        partial_name,
        extension,
        &mut results,
    );
    serde_json::to_string(&results).unwrap_or_else(|_| "[]".to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn test_deserialize_ws_message() {
        let json_message = json!({
            "channel": "actions",
            "action": {
                "readfolder": "."
            }
        })
        .to_string();

        let ws_message: WSMessage =
            serde_json::from_str(&json_message).expect("Failed to deserialize WSMessage");

        assert_eq!(ws_message.channel, WSChannel::Actions);
        if let WSTauriAction::ReadFolder(payload) = ws_message.action {
            assert_eq!(payload, ".");
        } else {
            panic!("Expected WSTauriAction::ReadFolder");
        }
    }
}
