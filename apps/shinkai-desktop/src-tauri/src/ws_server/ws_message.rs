use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum WSChannel {
    Actions,
    // Add other channels as needed
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct WSMessage {
    pub channel: WSChannel,
    pub action: WSTauriAction,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct FileSearchCriteria {
    pub partial_file_name: String,
    pub extension_name: String,
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum WSTauriAction {
    ReadFile(String),
    ReadFolder(String),
    WriteFile(WriteFSContent),
    FindFilesByName(FileSearchCriteria),
}

#[derive(Serialize, Deserialize, Debug, PartialEq)]
pub struct WriteFSContent {
    pub name: String,
    pub destination: String,
    pub content: String,
}
