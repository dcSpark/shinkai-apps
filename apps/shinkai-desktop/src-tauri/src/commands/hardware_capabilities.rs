use crate::hardware::{hardware_get_summary, HardwareSummary};

#[tauri::command]
pub fn hardware_capabilities_get_summary() -> Result<HardwareSummary, String> {
    let hardware_summary = hardware_get_summary();
    Ok(hardware_summary)
}
