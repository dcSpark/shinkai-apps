use std::sync::Arc;

use lazy_static::lazy_static;
use tokio::sync::Mutex;
use crate::local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;
lazy_static! {
    pub static ref SHINKAI_NODE_MANAGER_INSTANCE: Arc<Mutex<ShinkaiNodeManager>> = Arc::new(Mutex::new(ShinkaiNodeManager::new()));
}
