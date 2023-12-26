// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
pub mod fractal;
pub mod renderer;
use api::FractalRequest;
use renderer::FractalImage;

#[tauri::command]
async fn calc_image(request: FractalRequest) -> Vec<u8> {
    FractalImage::from(request).render().take_ui_pixels()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![calc_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
