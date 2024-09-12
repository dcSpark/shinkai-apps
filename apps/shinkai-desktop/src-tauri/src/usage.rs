use serde::Serialize;
use sysinfo::System;

#[derive(Serialize)]
struct HardwareStats {
    cpu_usage: f32,
    memory_usage: u64,
    gpu_usage: Option<f32>,
    per_core_usage: Vec<f32>, // Added field for per-core usage
}

pub async fn stream_hardware_stats() {
    let mut sys = System::new_all();
    sys.refresh_all();

    loop {
        sys.refresh_cpu();
        sys.refresh_memory();

        let cpu_usage = sys.global_cpu_info().cpu_usage(); // Overall CPU usage
        let memory_usage = sys.used_memory() / 1024 / 1024; // in MB

        // Get per-core CPU usage
        let per_core_usage: Vec<f32> = sys.cpus().iter().map(|cpu| cpu.cpu_usage()).collect();

        // GPU usage is not directly available from sysinfo or wgpu, so we set it to None for now
        let gpu_usage = None;

        let stats = HardwareStats {
            cpu_usage,
            memory_usage,
            gpu_usage,
            per_core_usage, // Include per-core usage in stats
        };

        let json_stats = serde_json::to_string(&stats).unwrap();

        // println!("{}", json_stats);

        // Sleep for a second before sending the next update
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;
    }
}
