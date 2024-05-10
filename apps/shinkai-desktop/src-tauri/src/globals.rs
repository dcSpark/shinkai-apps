use std::sync::Arc;

use crate::local_shinkai_node::shinkai_node_manager::ShinkaiNodeManager;
use once_cell::sync::OnceCell;
use tokio::sync::Mutex;

pub static SHINKAI_NODE_MANAGER_INSTANCE: OnceCell<Arc<Mutex<ShinkaiNodeManager>>> = OnceCell::new();
