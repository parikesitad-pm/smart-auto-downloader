pub mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            commands::download::start_download,
            commands::download::cancel_download,
            commands::download::fetch_media_preview,
            commands::system::get_build_info,
            commands::system::open_download_folder,
            commands::system::run_network_test,
            commands::whatsapp::read_whatsapp_status_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Smart Auto Downloader application");
}
