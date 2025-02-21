
use std::sync::Arc;

use crate::local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;
use once_cell::sync::OnceCell;

pub static SHINKAI_NODE_MANAGER_INSTANCE: OnceCell<Arc<tokio::sync::RwLock<ShinkaiNodeManager>>> =
    OnceCell::new();
