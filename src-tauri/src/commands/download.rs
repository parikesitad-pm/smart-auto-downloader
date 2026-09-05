use serde::{Deserialize, Serialize};
use std::process::Stdio;
use tauri::{AppHandle, Emitter};
use tokio::io::{AsyncBufReadExt, BufReader};
use tokio::process::Command;
use regex::Regex;

#[cfg(windows)]
const CREATE_NO_WINDOW: u32 = 0x08000000;

#[derive(Debug, Clone, Deserialize)]
pub struct DownloadPayload {
    pub id: String,
    pub url: String,
    pub platform: String,
    pub format_type: String, // "video" or "audio"
    pub video_quality: Option<String>,
    pub audio_format: Option<String>,
    pub output_dir: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgressEvent {
    pub id: String,
    pub progress: ProgressData,
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgressData {
    pub percentage: f64,
    pub downloaded_bytes: u64,
    pub total_bytes: u64,
    pub speed_bytes_per_sec: f64,
    pub eta_seconds: u64,
    pub current_step: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CompleteEvent {
    pub id: String,
    pub output_path: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct ErrorEvent {
    pub id: String,
    pub error: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaylistItem {
    pub id: String,
    pub title: String,
    pub url: String,
    pub duration: Option<String>,
    pub thumbnail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MediaPreviewResponse {
    pub is_playlist: bool,
    pub title: String,
    pub thumbnail: Option<String>,
    pub uploader: Option<String>,
    pub duration: Option<String>,
    pub items: Vec<PlaylistItem>,
}

#[tauri::command]
pub async fn fetch_media_preview(url: String) -> Result<MediaPreviewResponse, String> {
    let clean_url = url.trim().to_string();
    let mut cmd = Command::new("yt-dlp");
    cmd.args(&[
        "--dump-single-json",
        "--flat-playlist",
        "--skip-download",
        "--no-warnings",
        &clean_url,
    ])
    .stdout(Stdio::piped())
    .stderr(Stdio::piped());

    #[cfg(windows)]
    cmd.creation_flags(CREATE_NO_WINDOW);

    let output = cmd.output().await.map_err(|e| format!("Gagal memanggil yt-dlp: {}", e))?;

    if !output.status.success() {
        let err = String::from_utf8_lossy(&output.stderr);
        return Err(format!("yt-dlp error: {}", err));
    }

    let json_str = String::from_utf8_lossy(&output.stdout);
    let val: serde_json::Value = serde_json::from_str(&json_str).map_err(|e| format!("Gagal membaca metadata JSON: {}", e))?;

    let is_playlist = val.get("_type").and_then(|v| v.as_str()) == Some("playlist")
        || val.get("entries").and_then(|v| v.as_array()).is_some();

    let title = val.get("title").and_then(|v| v.as_str()).unwrap_or("Unknown Title").to_string();
    let thumbnail = val.get("thumbnail").and_then(|v| v.as_str()).map(|s| s.to_string());
    let uploader = val.get("uploader").or_else(|| val.get("channel")).and_then(|v| v.as_str()).map(|s| s.to_string());

    let duration_str = if let Some(secs) = val.get("duration").and_then(|v| v.as_f64()) {
        let total_sec = secs as u64;
        let m = total_sec / 60;
        let s = total_sec % 60;
        Some(format!("{:02}:{:02}", m, s))
    } else {
        None
    };

    let mut items = Vec::new();
    if let Some(entries) = val.get("entries").and_then(|v| v.as_array()) {
        for entry in entries {
            let item_id = entry.get("id").and_then(|v| v.as_str()).unwrap_or("").to_string();
            let item_title = entry.get("title").and_then(|v| v.as_str()).unwrap_or("Item Video").to_string();
            let item_url = entry.get("url").and_then(|v| v.as_str())
                .map(|u| if u.starts_with("http") { u.to_string() } else { format!("https://www.youtube.com/watch?v={}", item_id) })
                .unwrap_or_else(|| format!("https://www.youtube.com/watch?v={}", item_id));
            let item_thumb = entry.get("thumbnails").and_then(|t| t.as_array()).and_then(|arr| arr.last()).and_then(|thumb| thumb.get("url")).and_then(|u| u.as_str())
                .or_else(|| entry.get("thumbnail").and_then(|t| t.as_str()))
                .map(|s| s.to_string());
            let item_dur = entry.get("duration").and_then(|v| v.as_f64()).map(|d| {
                let sec = d as u64;
                format!("{:02}:{:02}", sec / 60, sec % 60)
            });

            items.push(PlaylistItem {
                id: item_id,
                title: item_title,
                url: item_url,
                duration: item_dur,
                thumbnail: item_thumb,
            });
        }
    }

    Ok(MediaPreviewResponse {
        is_playlist,
        title,
        thumbnail,
        uploader,
        duration: duration_str,
        items,
    })
}

#[tauri::command]
pub async fn start_download(app: AppHandle, item: DownloadPayload) -> Result<(), String> {
    let item_id = item.id.clone();
    let url = item.url.clone();
    let format_type = item.format_type.clone();
    let video_quality = item.video_quality.clone().unwrap_or_else(|| "best".to_string());
    let audio_format = item.audio_format.clone().unwrap_or_else(|| "mp3_320k".to_string());

    let download_dir = item
        .output_dir
        .unwrap_or_else(|| dirs::download_dir().map(|d| d.to_string_lossy().to_string()).unwrap_or_else(|| ".".to_string()));

    let _ = std::fs::create_dir_all(&download_dir);

    tokio::spawn(async move {
        // Build yt-dlp argument vector
        let mut args: Vec<String> = vec![
            "--newline".to_string(),
            "--progress".to_string(),
            "--no-warnings".to_string(),
            "--no-mtime".to_string(),
            "-o".to_string(),
            format!("{}/%(title)s.%(ext)s", download_dir),
        ];

        if format_type == "audio" {
            args.push("-x".to_string());
            if audio_format.contains("320") {
                args.push("--audio-format".to_string());
                args.push("mp3".to_string());
                args.push("--audio-quality".to_string());
                args.push("320k".to_string());
            } else if audio_format.contains("m4a") {
                args.push("--audio-format".to_string());
                args.push("m4a".to_string());
            } else if audio_format.contains("wav") {
                args.push("--audio-format".to_string());
                args.push("wav".to_string());
            } else {
                args.push("--audio-format".to_string());
                args.push("mp3".to_string());
                args.push("--audio-quality".to_string());
                args.push("192k".to_string());
            }
        } else {
            // Video format selector with FFmpeg auto-muxing
            let format_arg = match video_quality.as_str() {
                "2160p" => "bestvideo[height<=2160]+bestaudio/best[height<=2160]",
                "1440p" => "bestvideo[height<=1440]+bestaudio/best[height<=1440]",
                "1080p" => "bestvideo[height<=1080]+bestaudio/best[height<=1080]",
                "720p" => "bestvideo[height<=720]+bestaudio/best[height<=720]",
                "480p" => "bestvideo[height<=480]+bestaudio/best[height<=480]",
                _ => "bestvideo+bestaudio/best",
            };
            args.push("-f".to_string());
            args.push(format_arg.to_string());
            args.push("--merge-output-format".to_string());
            args.push("mp4".to_string());
        }

        args.push(url);

        // Spawn child process with async piped stdout & CREATE_NO_WINDOW
        let mut cmd = Command::new("yt-dlp");
        cmd.args(&args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped());

        #[cfg(windows)]
        cmd.creation_flags(CREATE_NO_WINDOW);

        let child_res = cmd.spawn();

        let mut child = match child_res {
            Ok(c) => c,
            Err(e) => {
                let _ = app.emit(
                    "download-error",
                    ErrorEvent {
                        id: item_id,
                        error: format!("Failed to spawn yt-dlp binary: {}", e),
                    },
                );
                return;
            }
        };

        // Regex parser for [download]  45.2% of ~  42.50MiB at  5.23MiB/s ETA 00:05
        let progress_regex = Regex::new(
            r"\[download\]\s+([\d\.]+)%\s+of\s+~?([\d\.]+)(\w+)\s+at\s+([\d\.]+)(\w+/s)\s+ETA\s+(\d+):(\d+)",
        ).unwrap();

        if let Some(stdout) = child.stdout.take() {
            let reader = BufReader::new(stdout);
            let mut lines = reader.lines();

            while let Ok(Some(line)) = lines.next_line().await {
                if let Some(caps) = progress_regex.captures(&line) {
                    let percent: f64 = caps[1].parse().unwrap_or(0.0);
                    let size_val: f64 = caps[2].parse().unwrap_or(0.0);
                    let size_unit = &caps[3];
                    let speed_val: f64 = caps[4].parse().unwrap_or(0.0);
                    let speed_unit = &caps[5];
                    let eta_min: u64 = caps[6].parse().unwrap_or(0);
                    let eta_sec: u64 = caps[7].parse().unwrap_or(0);

                    let total_bytes = match size_unit {
                        "GiB" => (size_val * 1024.0 * 1024.0 * 1024.0) as u64,
                        "MiB" => (size_val * 1024.0 * 1024.0) as u64,
                        "KiB" => (size_val * 1024.0) as u64,
                        _ => (size_val * 1024.0 * 1024.0) as u64,
                    };

                    let speed_bytes = if speed_unit.contains("MiB") {
                        speed_val * 1024.0 * 1024.0
                    } else if speed_unit.contains("KiB") {
                        speed_val * 1024.0
                    } else {
                        speed_val * 1024.0 * 1024.0
                    };

                    let downloaded_bytes = (total_bytes as f64 * (percent / 100.0)) as u64;
                    let eta_total_sec = (eta_min * 60) + eta_sec;

                    let _ = app.emit(
                        "download-progress",
                        ProgressEvent {
                            id: item_id.clone(),
                            progress: ProgressData {
                                percentage: percent,
                                downloaded_bytes,
                                total_bytes,
                                speed_bytes_per_sec: speed_bytes,
                                eta_seconds: eta_total_sec,
                                current_step: "Streaming from CDN...".to_string(),
                            },
                        },
                    );
                }
            }
        }

        let status = child.wait().await;
        match status {
            Ok(exit_code) if exit_code.success() => {
                let _ = app.emit(
                    "download-complete",
                    CompleteEvent {
                        id: item_id,
                        output_path: download_dir,
                    },
                );
            }
            Ok(exit_code) => {
                let _ = app.emit(
                    "download-error",
                    ErrorEvent {
                        id: item_id,
                        error: format!("Process exited with code: {:?}", exit_code.code()),
                    },
                );
            }
            Err(e) => {
                let _ = app.emit(
                    "download-error",
                    ErrorEvent {
                        id: item_id,
                        error: format!("Download execution error: {}", e),
                    },
                );
            }
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn cancel_download(id: String) -> Result<bool, String> {
    // In Tauri async tasks, cancel flag can be stored in state
    println!("Requested cancellation for download: {}", id);
    Ok(true)
}
