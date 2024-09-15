use std::fs;
use std::fs::File;
use std::io::Read;
use std::io::Write;
use std::os::unix::fs::PermissionsExt;

use futures_util::SinkExt;
use futures_util::StreamExt;
use tokio::net::{TcpListener, TcpStream};

use base64::engine::general_purpose::STANDARD;
use base64::prelude::*;

use crate::ws_server::ws_message::WSChannel;
use crate::ws_server::ws_message::WSMessage;
use crate::ws_server::ws_message::WSTauriAction;

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
                            eprintln!("Writing file: {}", content.name);
                            let result = write_file_content(
                                &content.name,
                                &content.destination,
                                &content.content,
                            );
                            if let Err(e) = write
                                .send(tokio_tungstenite::tungstenite::Message::Text(result))
                                .await
                            {
                                eprintln!("Error sending message: {}", e);
                            }
                        } // Handle other actions as needed
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
    let downloads_path = dirs::home_dir().unwrap().join("tauri_playground");
    match fs::read_dir(&downloads_path) {
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
    let downloads_path = dirs::home_dir()
        .unwrap()
        .join("tauri_playground")
        .join(file_name);
    let mut file = match File::open(&downloads_path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Error opening file {}: {}", downloads_path.display(), e);
            return "[]".to_string();
        }
    };

    let mut content = Vec::new();
    if let Err(e) = file.read_to_end(&mut content) {
        eprintln!("Error reading file {}: {}", downloads_path.display(), e);
        return "[]".to_string();
    }

    // Encode the binary content to base64
    STANDARD.encode(content)
}

fn write_file_content(name: &str, destination: &str, content: &str) -> String {
    let downloads_path = dirs::home_dir()
        .unwrap()
        .join("tauri_playground")
        .join(destination)
        .join(name);

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
            return "Error decoding base64 content".to_string();
        }
    };
    eprintln!("Decoded content: {:?}", decoded_content);

    let mut file = match File::create(&downloads_path) {
        Ok(file) => file,
        Err(e) => {
            eprintln!("Error creating file {}: {}", downloads_path.display(), e);
            return "Error creating file".to_string();
        }
    };
    eprintln!("Writing to file: {:?}", downloads_path.display());

    if let Err(e) = file.write_all(&decoded_content) {
        eprintln!("Error writing to file {}: {}", downloads_path.display(), e);
        return "Error writing to file".to_string();
    }

    "File written successfully".to_string()
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
