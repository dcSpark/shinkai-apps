use crate::galxe;

#[tauri::command]
pub fn galxe_generate_proof(node_signature: &str, payload: &str) -> Result<(String, String), String> {
    galxe::generate_proof(node_signature.to_string(), payload.to_string())
}
