use crate::galxe;

#[tauri::command]
pub fn galxe_generate_proof(node_signature: &str, json_string: &str) -> Result<(String, String), String> {
    galxe::generate_proof(node_signature.to_string(), json_string.to_string())
}
