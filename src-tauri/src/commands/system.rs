use serde::Serialize;
use std::time::Instant;
use tokio::net::TcpStream;
use tokio::time::{timeout, Duration};

#[derive(Debug, Clone, Serialize)]
pub struct SystemBuildInfo {
    pub version: String,
    pub commit_hash: String,
    pub target_os: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct EndpointLatency {
    pub name: String,
    pub host: String,
    pub latency_ms: u64,
    pub status: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct NetworkDiagnosticResult {
    pub is_online: bool,
    pub avg_latency_ms: u64,
    pub quality_tier: String,
    pub endpoints: Vec<EndpointLatency>,
    pub download_bandwidth_est: String,
}

#[tauri::command]
pub fn get_build_info() -> SystemBuildInfo {
    SystemBuildInfo {
        version: env!("CARGO_PKG_VERSION").to_string(),
        commit_hash: env!("GIT_COMMIT_HASH").to_string(),
        target_os: std::env::consts::OS.to_string(),
    }
}

#[tauri::command]
pub async fn open_download_folder(path: Option<String>) -> Result<(), String> {
    let target = path.unwrap_or_else(|| {
        dirs::download_dir()
            .map(|d| d.to_string_lossy().to_string())
            .unwrap_or_else(|| ".".to_string())
    });

    open::that(&target).map_err(|e| format!("Failed to open folder: {}", e))
}

async fn ping_endpoint(name: &str, host: &str) -> EndpointLatency {
    let start = Instant::now();
    let addr = format!("{}:443", host);
    let res = timeout(Duration::from_millis(2500), TcpStream::connect(&addr)).await;

    match res {
        Ok(Ok(_stream)) => {
            let elapsed = start.elapsed().as_millis() as u64;
            let status = if elapsed < 45 {
                "Optimal".to_string()
            } else if elapsed < 100 {
                "Good".to_string()
            } else if elapsed < 250 {
                "Moderate".to_string()
            } else {
                "Slow".to_string()
            };
            EndpointLatency {
                name: name.to_string(),
                host: host.to_string(),
                latency_ms: elapsed,
                status,
            }
        }
        _ => EndpointLatency {
            name: name.to_string(),
            host: host.to_string(),
            latency_ms: 999,
            status: "Unreachable".to_string(),
        },
    }
}

#[tauri::command]
pub async fn run_network_test() -> Result<NetworkDiagnosticResult, String> {
    let targets = vec![
        ("YouTube CDN", "www.youtube.com"),
        ("Cloudflare CDN", "1.1.1.1"),
        ("TikTok CDN", "www.tiktok.com"),
        ("Instagram CDN", "www.instagram.com"),
        ("Google Global", "8.8.8.8"),
    ];

    let mut handles = Vec::new();
    for (name, host) in targets {
        handles.push(tokio::spawn(async move {
            ping_endpoint(name, host).await
        }));
    }

    let mut endpoints = Vec::new();
    for handle in handles {
        if let Ok(res) = handle.await {
            endpoints.push(res);
        }
    }

    let reachable: Vec<&EndpointLatency> = endpoints.iter().filter(|e| e.status != "Unreachable").collect();
    let is_online = !reachable.is_empty();

    let avg_latency = if !reachable.is_empty() {
        let sum: u64 = reachable.iter().map(|e| e.latency_ms).sum();
        sum / (reachable.len() as u64)
    } else {
        999
    };

    let (quality_tier, bandwidth_est) = if !is_online {
        ("Offline", "0 Mbps")
    } else if avg_latency < 50 {
        ("Turbo (Ultra Fast)", "100+ Mbps (4K 60fps Ready)")
    } else if avg_latency < 120 {
        ("Fast (Broadband)", "50 - 100 Mbps (Full HD Ready)")
    } else if avg_latency < 250 {
        ("Normal (Standard)", "15 - 30 Mbps (720p HD Ready)")
    } else {
        ("Degraded", "< 10 Mbps (SD)")
    };

    Ok(NetworkDiagnosticResult {
        is_online,
        avg_latency_ms: avg_latency,
        quality_tier: quality_tier.to_string(),
        endpoints,
        download_bandwidth_est: bandwidth_est.to_string(),
    })
}
