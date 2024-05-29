use crate::hardware;

#[tauri::command]
pub fn hardware_get_summary() -> Result<hardware::HardwareSummary, String> {
    let hardware_summary = hardware::hardware_get_summary();
    Ok(hardware_summary)
}
