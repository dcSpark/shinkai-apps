use crate::galxe;

#[tauri::command]
pub fn galxe_generate_desktop_installation_proof() -> Result<(String, String), String> {
    galxe::generate_desktop_installation_proof()
}
