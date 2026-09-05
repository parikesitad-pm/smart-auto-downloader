use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct SystemBuildInfo {
    pub version: String,
    pub commit_hash: String,
    pub target_os: String,
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
