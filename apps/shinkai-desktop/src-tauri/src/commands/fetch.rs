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
pub async fn get_request(url: String, custom_headers: HashMap<String, String>) -> Result<FetchResponse, String> {
    log::debug!("get_request called with url: {}", url);
    println!("get_request called with url: {}", url);
    eprintln!("get_request");

    // Create a client
    let client = reqwest::Client::new();

    // Convert custom headers to HeaderMap
    let mut headers = HeaderMap::new();
    for (key, value) in custom_headers {
        let header_name = key.parse::<reqwest::header::HeaderName>().unwrap();
        let header_value = value.parse::<reqwest::header::HeaderValue>().unwrap();
        headers.insert(header_name, header_value);
    }

    // Perform the HTTP GET request with headers
    let response = client.get(&url)
        .headers(headers)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Extract the status code
    let status = response.status().as_u16();

    // Convert response headers to a serializable HashMap
    let response_headers = header_map_to_hashmap(response.headers());

    // Extract the response body as text
    let body = response.text().await.map_err(|e| e.to_string())?;

    // Construct the FetchResponse
    Ok(FetchResponse { status, headers: response_headers, body })
}

#[tauri::command]
pub async fn post_request(url: String, custom_headers: HashMap<String, String>, body: String) -> Result<FetchResponse, String> {
    log::debug!("post_request called with url: {}", url);
    println!("post_request called with url: {}", url);
    eprintln!("posting data");

    // Create a client
    let client = reqwest::Client::new();

    // Convert custom headers to HeaderMap
    let mut headers = HeaderMap::new();
    for (key, value) in custom_headers {
        let header_name = key.parse::<reqwest::header::HeaderName>().unwrap();
        let header_value = value.parse::<reqwest::header::HeaderValue>().unwrap();
        headers.insert(header_name, header_value);
    }

    // Perform the HTTP POST request with headers and body
    let response = client.post(&url)
        .headers(headers)
        .body(body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    // Extract the status code
    let status = response.status().as_u16();

    // Convert response headers to a serializable HashMap
    let response_headers = header_map_to_hashmap(response.headers());

    // Extract the response body as text
    let response_body = response.text().await.map_err(|e| e.to_string())?;

    // Construct the FetchResponse
    Ok(FetchResponse { status, headers: response_headers, body: response_body })
}
