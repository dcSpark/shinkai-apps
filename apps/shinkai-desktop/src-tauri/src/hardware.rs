use serde::Serialize;
use sysinfo::System;
use wgpu::DeviceType;

#[derive(Serialize)]
pub struct Hardware {
    cpus: usize,
    memory: u64,
    discrete_gpu: bool,
}

#[derive(Serialize)]
pub struct Requirement {
    cpus: usize,
    memory: u64,
    discrete_gpu: bool,
}

#[derive(Serialize)]
pub struct Requirements {
    still_usable: Requirement,
    minimum: Requirement,
    recommended: Requirement,
    optimal: Requirement,
}

#[derive(Serialize)]
pub enum RequirementsStatus {
    Unmeet,
    StillUsable,
    Minimum,
    Recommended,
    Optimal,
}

#[derive(Serialize)]
pub struct HardwareSummary {
    pub hardware: Hardware,
    pub requirements: Requirements,
    pub requirements_status: RequirementsStatus,
}

pub const STILL_USABLE_CPUS: usize = 4;
pub const STILL_USABLE_MEMORY: u64 = 8;
pub const MIN_CPUS: usize = 4;
pub const MIN_MEMORY: u64 = 16;
pub const RECOMMENDED_CPUS: usize = 10;
pub const RECOMMENDED_MEMORY: u64 = 32;
pub const REQUIREMENTS: Requirements = Requirements {
    still_usable: Requirement {
        cpus: STILL_USABLE_CPUS,
        memory: STILL_USABLE_MEMORY,
        discrete_gpu: false,
    },
    minimum: Requirement {
        cpus: MIN_CPUS,
        memory: MIN_MEMORY,
        discrete_gpu: false,
    },
    recommended: Requirement {
        cpus: RECOMMENDED_CPUS,
        memory: RECOMMENDED_MEMORY,
        discrete_gpu: false,
    },
    optimal: Requirement {
        cpus: RECOMMENDED_CPUS,
        memory: RECOMMENDED_MEMORY,
        discrete_gpu: true,
    },
};

pub fn hardware_get_summary() -> HardwareSummary {
    let instance = wgpu::Instance::default();
    let adapters = instance.enumerate_adapters(wgpu::Backends::all());
    let mut discrete_gpu = false;
    for (_, adapter) in adapters.iter().enumerate() {
        if adapter.get_info().device_type == DeviceType::DiscreteGpu {
            discrete_gpu = true;
            break;
        }
    }
    let mut sys = System::new_all();
    sys.refresh_all();

    // memory in GB
    let memory = sys.total_memory() / 1024 / 1024 / 1024;
    let cpus = sys.cpus().len();

    let requirement_status;
    if cpus >= RECOMMENDED_CPUS && memory >= RECOMMENDED_MEMORY && discrete_gpu {
        requirement_status = RequirementsStatus::Optimal;
    } else if cpus >= RECOMMENDED_CPUS && memory >= RECOMMENDED_MEMORY {
        requirement_status = RequirementsStatus::Recommended;
    } else if cpus >= MIN_CPUS && memory >= MIN_MEMORY {
        requirement_status = RequirementsStatus::Minimum;
    } else if cpus >= STILL_USABLE_CPUS && memory > STILL_USABLE_MEMORY {
        requirement_status = RequirementsStatus::StillUsable;
    } else {
        requirement_status = RequirementsStatus::Unmeet;
    }
    HardwareSummary {
        hardware: Hardware {
            cpus,
            memory,
            discrete_gpu,
        },
        requirements: REQUIREMENTS,
        requirements_status: requirement_status,
    }
}
