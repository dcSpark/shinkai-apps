use serde_json::Value;

#[tauri::command]
pub async fn fetch_transactions(address: String, network: String, page: Option<u32>) -> Result<Value, String> {
    let page = page.unwrap_or(1);
    let base_url = match network.as_str() {
        "BaseSepolia" | "Base-sepolia" => "https://api-sepolia.basescan.org/api",
        _ => "https://api.basescan.org/api",
    };
    let url = format!(
        "{base_url}?module=account&action=txlist&address={address}&sort=desc&page={page}&offset=10"
    );
    let res = reqwest::get(&url).await.map_err(|e| e.to_string())?;
    let text = res.text().await.map_err(|e| e.to_string())?;
    serde_json::from_str(&text).map_err(|e| e.to_string())
}

