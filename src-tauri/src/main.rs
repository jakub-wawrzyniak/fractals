// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod api;
mod fractal;
mod renderer;

use api::{ExportFractalRequest, ExportResult, FractalTileRequest};
use renderer::{take_and_flip, FractalImage};

#[tauri::command]
async fn calc_image(request: FractalTileRequest) -> Vec<u8> {
    let image = FractalImage::from(request).render_on_threads();
    take_and_flip(image)
}

#[tauri::command]
async fn export_image(request: ExportFractalRequest) -> ExportResult {
    let path = request.filepath.clone();
    if let Err(_) = image::ImageFormat::from_path(&path) {
        return ExportResult::ErrorBadFileType;
    }
    match FractalImage::from(request).render_on_threads().save(path) {
        Err(_) => ExportResult::ErrorUnknown,
        Ok(_) => ExportResult::Done,
    }
}

#[tauri::command]
fn get_default_save_dir() -> Option<String> {
    let path = match dirs::picture_dir() {
        Some(path) => path,
        None => match dirs::home_dir() {
            Some(path) => path,
            None => return None,
        },
    };
    Some(path.to_str()?.to_owned())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            calc_image,
            export_image,
            get_default_save_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
