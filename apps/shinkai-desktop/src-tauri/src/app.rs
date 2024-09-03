use once_cell::sync::OnceCell;
use tauri::AppHandle;
use tokio::sync::Mutex;

pub static APP_HANDLE: OnceCell<Mutex<AppHandle>> = OnceCell::new();
