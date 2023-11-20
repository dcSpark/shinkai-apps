use reqwest::Error;
use serde_json::json;

pub async fn make_request(node_address: String, user_data: String) -> Result<String, Error> {
    let client = reqwest::Client::new();
    let res = client.post("https://httpbin.org/post")
        .json(&json!({"key": "value"}))
        .send()
        .await?
        .text()
        .await?;
    Ok(res)
}