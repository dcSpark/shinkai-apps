use crate::local_shinkai_node::shinkai_node_manager_instance::SHINKAI_NODE_MANAGER_INSTANCE;
use crate::local_shinkai_node::shinkai_node_options::ShinkaiNodeOptions;

#[tauri::command]
pub async fn shinkai_node_is_running() -> Result<bool, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().await;
    let is_running = shinkai_node_manager_guard.is_running().await;
    Ok(is_running)
}

#[tauri::command]
pub async fn shinkai_node_get_last_n_logs(length: usize) -> Result<Vec<String>, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().await;
    let logs = shinkai_node_manager_guard.get_last_n_logs(length).await;
    Ok(logs)
}

#[tauri::command]
pub async fn shinkai_node_set_options(options: ShinkaiNodeOptions) -> Result<ShinkaiNodeOptions, String> {
    let mut shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().await;
    let options = shinkai_node_manager_guard.set_options(options);
    Ok(options)
}

#[tauri::command]
pub async fn shinkai_node_get_options() -> Result<ShinkaiNodeOptions, String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().await;
    let options = shinkai_node_manager_guard.get_options();
    Ok(options)
}

#[tauri::command]
pub async fn shinkai_node_spawn() -> Result<(), String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().await;

    match shinkai_node_manager_guard.spawn_shinkai_node().await {
        Ok(_) => {
            return Ok(());
        }
        Err(message) => {
            return Err(message);
        }
    }
}

#[tauri::command]
pub async fn shinkai_node_kill() -> Result<(), String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().await;
    shinkai_node_manager_guard.kill_shinkai_node().await;
    Ok(())
}

#[tauri::command]
pub async fn shinkai_node_remove_storage() -> Result<(), String> {
    let shinkai_node_manager_guard = SHINKAI_NODE_MANAGER_INSTANCE.lock().await;
    return match shinkai_node_manager_guard.remove_storage().await {
        Ok(_) => {
            Ok(())
        }
        Err(_) => {
            Ok(())
        }
    }
}
