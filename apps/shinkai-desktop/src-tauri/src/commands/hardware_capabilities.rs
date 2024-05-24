use serde::Serialize;
use sysinfo::System;
use wgpu::DeviceType;

#[derive(Serialize)]
pub struct HardwareCapabilitiesSummary {
    pub has_discrete_gpu: bool,
    pub memory: u64,
    pub cpus: usize,
}

#[tauri::command]
pub fn hardware_capabilities_get_summary() -> Result<HardwareCapabilitiesSummary, String> {
    let instance = wgpu::Instance::default();
    let adapters = instance.enumerate_adapters(wgpu::Backends::all());
    let mut has_discrete_gpu = false;
    for (i, adapter) in adapters.iter().enumerate() {
        if adapter.get_info().device_type == DeviceType::DiscreteGpu {
            has_discrete_gpu = true;
            break;
        }
    }

    let mut sys = System::new_all();
    sys.refresh_all();
    let memory = sys.total_memory();
    let cpus = sys.cpus().len();
    Ok(HardwareCapabilitiesSummary {
        has_discrete_gpu,
        memory,
        cpus,
    })
}
