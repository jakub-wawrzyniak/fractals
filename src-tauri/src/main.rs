// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
pub mod fractal;
pub mod renderer;
use api::FractalRequest;
use renderer::FractalImage;

#[tauri::command]
async fn calc_image(request: FractalRequest) -> Vec<u8> {
    println!("Request start");
    let out = FractalImage::from(request)
        .render(request.fractal_variant.into())
        .take_ui_pixels();
    println!("Request end");
    return out;
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![calc_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
