use crate::globals::SHINKAI_NODE_MANAGER_INSTANCE;
use crate::local_shinkai_node::process_handlers::logger::LogEntry;
use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;

#[tauri::command]
pub async fn shinkai_node_is_running() -> Result<bool, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    let is_running = shinkai_node_manager_guard.is_running().await;
    Ok(is_running)
}

#[tauri::command]
pub async fn shinkai_node_get_last_n_logs(length: usize) -> Result<Vec<LogEntry>, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    let logs = shinkai_node_manager_guard
        .get_last_n_shinkai_node_logs(length)
        .await;
    Ok(logs)
}

#[tauri::command]
pub async fn shinkai_node_set_options(
    options: ShinkaiNodeOptions,
) -> Result<ShinkaiNodeOptions, String> {
    let mut shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    let options = shinkai_node_manager_guard
        .set_shinkai_node_options(options)
        .await;
    Ok(options)
}

#[tauri::command]
pub async fn shinkai_node_get_options() -> Result<ShinkaiNodeOptions, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    let options = shinkai_node_manager_guard.get_shinkai_node_options().await;
    Ok(options)
}

#[tauri::command]
pub async fn shinkai_node_spawn() -> Result<(), String> {
    let mut shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    match shinkai_node_manager_guard.spawn().await {
        Ok(_) => Ok(()),
        Err(message) => Err(message),
    }
}

#[tauri::command]
pub async fn shinkai_node_kill() -> Result<(), String> {
    let mut shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    shinkai_node_manager_guard.kill().await;
    Ok(())
}

#[tauri::command]
pub async fn shinkai_node_remove_storage(preserve_keys: bool) -> Result<(), String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    match shinkai_node_manager_guard.remove_storage(preserve_keys).await {
        Ok(_) => Ok(()),
        Err(_) => Ok(()),
    }
}

#[tauri::command]
pub async fn shinkai_node_set_default_options() -> Result<ShinkaiNodeOptions, String> {
    let mut shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    let options = shinkai_node_manager_guard
        .set_default_shinkai_node_options()
        .await;
    Ok(options)
}

#[tauri::command]
pub async fn shinkai_node_get_ollama_api_url() -> Result<String, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.get().unwrap().lock().await;
    let ollama_api_url = shinkai_node_manager_guard
        .get_ollama_api_url();
    Ok(ollama_api_url)
}

#[tauri::command]
pub async fn shinkai_node_get_default_model() -> Result<String, String> {
    let model = ShinkaiNodeOptions::default_initial_model();
    Ok(model)
}
