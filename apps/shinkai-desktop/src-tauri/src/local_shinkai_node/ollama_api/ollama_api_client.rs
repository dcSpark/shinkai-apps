use futures_util::{Stream, StreamExt};
use reqwest;

use super::ollama_api_types::{OllamaApiPullRequest, OllamaApiPullResponse, OllamaApiTagsResponse};

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
                    println!("{:?}", stream_value);
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
    ) -> Result<Box<dyn Stream<Item = Result<OllamaApiPullResponse, String>> + Send + Unpin>, String> {
        let url = format!("{}/api/pull", self.base_url);
        let client = reqwest::Client::new();
        let body: OllamaApiPullRequest = OllamaApiPullRequest {
            stream: true,
            model: model_name.to_string(),
        };
        let response = client.post(&url).json(&body).send().await.map_err(|e| e.to_string())?;
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
                return Err(json_message["error"].as_str().unwrap_or("error").to_string());
            }
            let status = json_message["status"]
                .as_str()
                .unwrap_or("Unknown")
                .to_string();
            let value = match status.clone() {
                s if s.contains("pulling manifest") =>
                    OllamaApiPullResponse::PullingManifest { status },
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
        let result = Box::new(mapped_stream) as Box<dyn Stream<Item = Result<OllamaApiPullResponse, String>> + Send + Unpin>; 
        Ok(result)
    }
}
