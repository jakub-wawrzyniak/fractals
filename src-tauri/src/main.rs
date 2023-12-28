// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
pub mod fractal;
pub mod renderer;
use api::FractalRequestLuma;
use renderer::FractalImage;

#[tauri::command]
async fn calc_image(request: FractalRequestLuma) -> Vec<u8> {
    FractalImage::from(request).render().into_raw()
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![calc_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
