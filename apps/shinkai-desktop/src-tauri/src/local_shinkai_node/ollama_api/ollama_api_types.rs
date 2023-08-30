use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone)]
pub struct Model {
    pub name: String,
    pub model: String,
    pub modified_at: String,
    pub size: u64,
    pub digest: String,
    pub details: ModelDetails,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ModelDetails {
    pub parent_model: String,
    pub format: String,
    pub family: String,
    pub families: Vec<String>,
    pub parameter_size: String,
    pub quantization_level: String,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OllamaApiTagsResponse {
    pub models: Vec<Model>,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct OllamaApiPullRequest {
    pub stream: bool,
    pub model: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum OllamaApiPullResponse {
    PullingManifest {
        status: String,
    },
    Downloading {
        status: String,
        digest: String,
        total: u64,
        completed: u64,
    },
    VerifyingDigest {
        status: String,
    },
    WritingManifest {
        status: String,
    },
    RemovingUnusedLayers {
        status: String,
    },
    Success {
        status: String,
    },
}
