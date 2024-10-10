use serde::Serialize;
use std::collections::HashMap;
use reqwest::header::HeaderMap;

#[derive(Serialize)]
pub struct FetchResponse {
    status: u16,
    headers: HashMap<String, Vec<String>>,
    body: String,
}

/// Converts a `HeaderMap` to a `HashMap<String, Vec<String>>`.
pub fn header_map_to_hashmap(headers: &HeaderMap) -> HashMap<String, Vec<String>> {
    headers.iter().fold(HashMap::new(), |mut acc, (key, value)| {
        let key_str = key.to_string();
        let value_str = value.to_str().unwrap_or("").to_string();
        acc.entry(key_str)
            .or_default()
            .push(value_str);
        acc
    })
}

#[tauri::command]
pub async fn fetch_page(url: String) -> Result<FetchResponse, String> {
    log::debug!("fetch_page called with url: {}", url);
    println!("fetch_page called with url: {}", url);
    eprintln!("fetching page");
    // Perform the HTTP GET request
    let response = reqwest::get(&url).await.map_err(|e| e.to_string())?;

    // Extract the status code
    let status = response.status().as_u16();

    // Convert headers to a serializable HashMap
    let headers = header_map_to_hashmap(response.headers());

    // Extract the response body as text
    let body = response.text().await.map_err(|e| e.to_string())?;

    // Construct the FetchResponse
    Ok(FetchResponse { status, headers, body })
}
