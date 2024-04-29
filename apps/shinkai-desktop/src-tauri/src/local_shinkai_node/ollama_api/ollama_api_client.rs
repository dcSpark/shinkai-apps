use crate::local_shinkai_node::ollama_api::ollama_api_types::{
    OllamaApiPullRequest, OllamaApiPullResponse, OllamaApiTagsResponse,
};
use futures_util::{Stream, StreamExt};
use reqwest;

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

    pub async fn pull_stream(
        &self,
        model_name: &str,
    ) -> Result<Box<dyn Stream<Item = OllamaApiPullResponse> + Send + Unpin>, reqwest::Error> {
        let url = format!("{}/api/pull", self.base_url);
        let client = reqwest::Client::new();
        let body: OllamaApiPullRequest = OllamaApiPullRequest {
            stream: true,
            model: model_name.to_string(),
        };
        let response = client.post(&url).json(&body).send().await?;
        let stream = response.bytes_stream();
        let stream = stream.map(|message_buffer| {
            if message_buffer.is_err() {
                return OllamaApiPullResponse::PullingManifest {
                    status: "pulling manifest".to_string(),
                };
            }
            let message_str = String::from_utf8_lossy(&message_buffer.unwrap()).to_string();
            let json_message: serde_json::Value = serde_json::from_str(&message_str).unwrap();
            let status = json_message["status"]
                .as_str()
                .unwrap_or("Unknown")
                .to_string();
            println!("{}", message_str);
            let value: OllamaApiPullResponse = match status.clone() {
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
            value
        });
        Ok(Box::new(stream))
    }
}
