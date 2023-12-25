// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub mod fractals;
use fractals::{JuliaImage, JuliaImageRequest};

#[tauri::command]
async fn calc_image(request: JuliaImageRequest) -> Vec<u8> {
    JuliaImage::from(request).compute().take_ui_pixels()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![calc_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
