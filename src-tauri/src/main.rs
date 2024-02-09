// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod color;
mod convert;
mod data;
mod fractal;
mod renderer;

use data::{ExportRequest, ExportResult, TileRequest};
use renderer::{into_data_url, FractalImage};

#[tauri::command]
async fn calc_tile(request: TileRequest) -> String {
    let fractal: FractalImage = request.into();
    let image = fractal.render_for_ui();
    into_data_url(image)
}

#[tauri::command]
async fn export_image(request: ExportRequest) -> ExportResult {
    let path = request.filepath.clone();
    if image::ImageFormat::from_path(&path).is_err() {
        return ExportResult::ErrorBadFileType;
    }
    let fractal: FractalImage = request.into();
    match fractal.render_on_threads().save(path) {
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
            calc_tile,
            export_image,
            get_default_save_dir
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
