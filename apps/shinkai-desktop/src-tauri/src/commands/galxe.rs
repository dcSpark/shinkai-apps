use crate::galxe;

#[tauri::command]
pub fn galxe_generate_desktop_installation_proof(node_signature: &str) -> Result<(String, String), String> {
    galxe::generate_desktop_installation_proof(node_signature.to_string())
}
