use futures_util::{Stream, StreamExt};
use reqwest;
use sha2::{Sha256, Digest};
use std::collections::HashMap;
use reqwest::header::HeaderValue;
use semver::{ Version, VersionReq };

use super::ollama_api_types::{OllamaApiPullRequest, OllamaApiPullResponse, OllamaApiTagsResponse, OllamaApiCreateRequest, OllamaApiCreateResponse, OllamaApiBlobResponse, OllamaApiVersionResponse};

pub struct OllamaApiClient {
    base_url: String,
}

impl OllamaApiClient {
    pub fn new(base_url: String) -> Self {
        OllamaApiClient { base_url }
    }

    pub async fn health(&self) -> Result<bool, reqwest::Error> {
        let url = format!("{}/", self.base_url);
        let client = reqwest::Client::new();
        let response = client.get(&url).send().await?;
        if response.status() == 200 {
            return Ok(true);
        }
        Ok(false)
    }

    pub async fn tags(&self) -> Result<OllamaApiTagsResponse, reqwest::Error> {
        let url = format!("{}/api/tags", self.base_url);
        let client = reqwest::Client::new();
        let response = client
            .get(&url)
            .send()
            .await?
            .json::<OllamaApiTagsResponse>()
            .await?;
        Ok(response)
    }

    pub async fn pull(&self, model_name: &str) -> Result<(), String> {
        match self.pull_stream(model_name).await {
            Ok(mut stream) => {
                while let Some(stream_value) = stream.next().await {
                    log::debug!("ollama pull stream value {:?}", stream_value);
                }
            }
            Err(e) => {
                return Err(e.to_string());
            }
        }
        Ok(())
    }

    pub async fn pull_stream(
        &self,
        model_name: &str,
    ) -> Result<Box<dyn Stream<Item = Result<OllamaApiPullResponse, String>> + Send + Unpin>, String>
    {
        let url = format!("{}/api/pull", self.base_url);
        let client = reqwest::Client::new();
        let body: OllamaApiPullRequest = OllamaApiPullRequest {
            stream: true,
            model: model_name.to_string(),
        };
        let response = client
            .post(&url)
            .json(&body)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let stream = response.bytes_stream();
        let mapped_stream = stream.map(|message_buffer| {
            if message_buffer.is_err() {
                return Err(message_buffer.unwrap_err().to_string());
            }
            let message_str = String::from_utf8_lossy(&message_buffer.unwrap()).to_string();
            let json_message_result = serde_json::from_str(&message_str);
            if json_message_result.is_err() {
                return Err(json_message_result.unwrap_err().to_string());
            }
            let json_message: serde_json::Value = json_message_result.unwrap();
            if json_message["error"].is_string() {
                return Err(json_message["error"]
                    .as_str()
                    .unwrap_or("error")
                    .to_string());
            }
            let status = json_message["status"]
                .as_str()
                .unwrap_or("Unknown")
                .to_string();
            let value = match status.clone() {
                s if s.contains("pulling manifest") => {
                    OllamaApiPullResponse::PullingManifest { status }
                }
                s if s.contains("pulling") => OllamaApiPullResponse::Downloading {
                    status,
                    digest: json_message["digest"]
                        .as_str()
                        .unwrap_or("Unknown")
                        .to_string(),
                    total: json_message["total"].as_u64().unwrap_or(0),
                    completed: json_message["completed"].as_u64().unwrap_or(0),
                },
                s if s.contains("verifying sha256 digest") => {
                    OllamaApiPullResponse::VerifyingDigest {
                        status: s.to_string(),
                    }
                }
                s if s.contains("writing manifest") => {
                    OllamaApiPullResponse::WritingManifest { status }
                }
                s if s.contains("removing any unused layers") => {
                    OllamaApiPullResponse::RemovingUnusedLayers { status }
                }

                s if s.contains("success") => OllamaApiPullResponse::Success { status },
                _ => OllamaApiPullResponse::PullingManifest { status },
            };
            Ok(value)
        });
        let result = Box::new(mapped_stream)
            as Box<dyn Stream<Item = Result<OllamaApiPullResponse, String>> + Send + Unpin>;
        Ok(result)
    }

    pub async fn get_ollama_version(&self) -> Result<String, String> {
        let url = format!("{}/api/version", self.base_url);
        let client = reqwest::Client::new();
        let response = client.get(&url).send().await.map_err(|e| e.to_string())?;
        let version_response = response
            .json::<OllamaApiVersionResponse>()
            .await
            .map_err(|e| e.to_string())?;
        Ok(version_response.version)
    }

    pub async fn upload_blob(&self, data: &[u8]) -> Result<String, String> {
        if data.len() == 0 {
            return Err("Data is empty".to_string());
        }
        // Calculate SHA256 of the data
        let mut hasher = Sha256::new();
        hasher.update(data);
        let digest = format!("sha256:{:x}", hasher.finalize());
        
        let url = format!("{}/api/blobs/{}", self.base_url, digest);
        let client = reqwest::Client::new();
        
        let response = client
            .post(&url)
            .body(data.to_vec())
            .send()
            .await
            .map_err(|e| e.to_string())?;
        if !response.status().is_success() {
            return Err(format!("Failed to upload blob: {}", response.status()));
        }
        Ok(digest)
    }

    pub async fn create_model_from_gguf(&self, _model_name: &str, gguf_data: &[u8]) -> Result<(), String> {
        // Check if ollama version is 0.5.7 or higher
        let version = self.get_ollama_version().await?;
        let parsed_version = Version::parse(&version)
            .map_err(|e| format!("Failed to parse Ollama version: {}", e))?;
        let requirement = VersionReq::parse(">=0.5.7")
            .map_err(|e| format!("Failed to parse version requirement: {}", e))?;

        if !requirement.matches(&parsed_version) {
            return Err(format!("Ollama version must be 0.5.7 or higher (found {})", version));
        }
        // Check GGUF magic number (first 4 bytes should spell "GGUF" in ASCII)
        if gguf_data.len() < 4 {
            return Err("GGUF data too short".to_string());
        }
        
        let magic = &gguf_data[0..4];
        if magic != b"GGUF" {
            return Err("Invalid GGUF magic number".to_string());
        }
        // First upload the GGUF file as a blob
        let digest = self.upload_blob(gguf_data).await?;
        // Check if blob exists on server before creating model
        let check_url = format!("{}/api/blobs/{}", self.base_url, digest);
        let client = reqwest::Client::new();
        
        let head_response = client
            .head(&check_url)
            .send()
            .await
            .map_err(|e| e.to_string())?;

        if !head_response.status().is_success() {
            return Err(format!("Blob {} not found on server", digest));
        }

        // Create a map for the files parameter
        let mut files = HashMap::new();
        files.insert("arctic.gguf".to_string(), digest);
        
        // Create the model using the uploaded blob
        let url = format!("{}/api/create", self.base_url);
        let client = reqwest::Client::new();
        
        let create_request = OllamaApiCreateRequest {
            model: "my-gguf-model".to_string(),
            files,
        };

        let response = client
            .post(&url)
            .json(&create_request)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        
        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(format!("Failed to create model: {} - {}", status, text));
        }

        let response_text = response.text().await.map_err(|e| e.to_string())?;
        let mut final_status = String::new();
        
        // Split the response text by newlines and parse each line as a JSON object
        for line in response_text.lines() {
            if line.trim().is_empty() {
                continue;
            }
            
            if let Ok(json_value) = serde_json::from_str::<serde_json::Value>(line) {
                if let Some(status) = json_value.get("status").and_then(|s| s.as_str()) {
                    final_status = status.to_string();
                }
            }
        }
        
        if final_status != "success" {
            return Err(format!("Failed to create model: {}", final_status));
        }
        
        Ok(())
    }
}
