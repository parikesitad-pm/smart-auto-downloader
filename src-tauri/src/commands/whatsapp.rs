use serde::Serialize;
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize)]
pub struct WhatsAppStatusItem {
    pub file_name: String,
    pub path: String,
    pub file_size: u64,
    pub is_video: bool,
}

#[tauri::command]
pub fn read_whatsapp_status_cache() -> Result<Vec<WhatsAppStatusItem>, String> {
    let mut items = Vec::new();

    // Potential Windows cache paths for WhatsApp Desktop / UWP / Android Subsystem
    let local_app_data = std::env::var("LOCALAPPDATA").unwrap_or_default();
    let candidate_paths = vec![
        PathBuf::from(&local_app_data).join("Packages").join("5319275A.WhatsAppDesktop_cv1g1gvanyjgm").join("LocalState"),
        PathBuf::from(&local_app_data).join("WhatsApp").join("cache"),
    ];

    for base in candidate_paths {
        if let Ok(entries) = fs::read_dir(base) {
            for entry in entries.flatten() {
                let path = entry.path();
                if let Some(ext) = path.extension().and_then(|s| s.to_str()) {
                    let ext_lower = ext.to_lowercase();
                    if matches!(ext_lower.as_str(), "mp4" | "jpg" | "jpeg" | "png" | "webp") {
                        if let Ok(metadata) = entry.metadata() {
                            items.push(WhatsAppStatusItem {
                                file_name: entry.file_name().to_string_lossy().to_string(),
                                path: path.to_string_lossy().to_string(),
                                file_size: metadata.len(),
                                is_video: ext_lower == "mp4",
                            });
                        }
                    }
                }
            }
        }
    }

    Ok(items)
}
