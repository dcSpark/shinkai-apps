
use std::sync::Arc;

use tauri::async_runtime::Mutex;

use crate::local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;

pub struct AppState {
  pub shinkai_node_manager: Arc<Mutex<ShinkaiNodeManager>>,
}
