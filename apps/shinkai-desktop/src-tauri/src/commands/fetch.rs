use reqwest::header::HeaderMap;
use serde::{Deserialize, Serialize};
use serde_json;
use std::collections::HashMap;

#[derive(Serialize)]
pub struct FetchResponse {
    status: u16,
    headers: HashMap<String, Vec<String>>,
    body: String,
}

#[derive(Serialize)]
pub struct StringFetchResponse {
    status: u16,
    headers: HashMap<String, Vec<String>>,
    data: String,
}

#[derive(Serialize)]
pub struct JsonFetchResponse {
    status: u16,
    headers: HashMap<String, Vec<String>>,
    data: serde_json::Value,
}

/// Converts a `HeaderMap` to a `HashMap<String, Vec<String>>`.
pub fn header_map_to_hashmap(headers: &HeaderMap) -> HashMap<String, Vec<String>> {
    headers
        .iter()
        .fold(HashMap::new(), |mut acc, (key, value)| {
            let key_str = key.to_string();
            let value_str = value.to_str().unwrap_or("").to_string();
            acc.entry(key_str).or_default().push(value_str);
            acc
        })
}

#[tauri::command]
pub async fn get_request(url: String, custom_headers: String) -> Result<FetchResponse, String> {
    log::debug!("get_request called with url: {}", url);
    log::debug!("get_request called with custom_headers: {}", custom_headers);
    println!("get_request called with url: {}", url);
    eprintln!("get_request");

    // Deserialize the JSON string into a HashMap
    let custom_headers: HashMap<String, String> =
        serde_json::from_str(&custom_headers).map_err(|e| e.to_string())?;

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
    let response = client
        .get(&url)
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
    Ok(FetchResponse {
        status,
        headers: response_headers,
        body,
    })
}

#[tauri::command]
pub async fn post_request(
    url: String,
    custom_headers: String,
    body: String,
) -> Result<FetchResponse, String> {
    log::debug!("post_request called with url: {}", url);
    println!("post_request called with url: {}", url);
    eprintln!("posting data");

    // Deserialize the JSON string into a HashMap
    let custom_headers: HashMap<String, String> =
        serde_json::from_str(&custom_headers).map_err(|e| e.to_string())?;

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
    let response = client
        .post(&url)
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
    Ok(FetchResponse {
        status,
        headers: response_headers,
        body: response_body,
    })
}

#[tauri::command]
pub async fn http_request_json(config: serde_json::Value) -> Result<JsonFetchResponse, String> {
    let method = config
        .get("method")
        .and_then(|m| m.as_str())
        .unwrap_or("GET");
    let url = config
        .get("url")
        .and_then(|u| u.as_str())
        .ok_or("URL is required")?;

    let headers_map = serde_json::Map::new();
    let headers = config
        .get("headers")
        .and_then(|h| h.as_object())
        .unwrap_or(&headers_map);

    let body = config.get("data").and_then(|b| b.as_str()).unwrap_or("");

    let mut header_map = HeaderMap::new();
    for (key, value) in headers {
        let header_name = key.parse::<reqwest::header::HeaderName>().unwrap();
        let header_value = value
            .as_str()
            .unwrap()
            .parse::<reqwest::header::HeaderValue>()
            .unwrap();
        header_map.insert(header_name, header_value);
    }

    let client = reqwest::Client::new();

    let response = match method {
        "POST" => {
            client
                .post(url)
                .headers(header_map)
                .body(body.to_string())
                .send()
                .await
        }
        _ => client.get(url).headers(header_map).send().await,
    }
    .map_err(|e| e.to_string())?;

    let status = response.status().as_u16();
    let response_headers = header_map_to_hashmap(response.headers());

    let response_body = response.json().await.map_err(|e| e.to_string())?;

    Ok(JsonFetchResponse {
        status,
        headers: response_headers,
        data: response_body,
    })
}

#[tauri::command]
pub async fn http_request_string(config: serde_json::Value) -> Result<StringFetchResponse, String> {
    let method = config
        .get("method")
        .and_then(|m| m.as_str())
        .unwrap_or("GET");
    let url = config
        .get("url")
        .and_then(|u| u.as_str())
        .ok_or("URL is required")?;

    let headers_map = serde_json::Map::new();
    let headers = config
        .get("headers")
        .and_then(|h| h.as_object())
        .unwrap_or(&headers_map);

    let body = config.get("data").and_then(|b| b.as_str()).unwrap_or("");

    let mut header_map = HeaderMap::new();
    for (key, value) in headers {
        let header_name = key.parse::<reqwest::header::HeaderName>().unwrap();
        let header_value = value
            .as_str()
            .unwrap()
            .parse::<reqwest::header::HeaderValue>()
            .unwrap();
        header_map.insert(header_name, header_value);
    }

    let client = reqwest::Client::new();

    let response = match method {
        "POST" => {
            client
                .post(url)
                .headers(header_map)
                .body(body.to_string())
                .send()
                .await
        }
        _ => client.get(url).headers(header_map).send().await,
    }
    .map_err(|e| e.to_string())?;

    let status = response.status().as_u16();
    let response_headers = header_map_to_hashmap(response.headers());

    let response_body = response.text().await.map_err(|e| e.to_string())?;

    Ok(StringFetchResponse {
        status,
        headers: response_headers,
        data: response_body,
    })
}
