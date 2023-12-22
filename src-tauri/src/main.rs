// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

mod fractals;
use fractals::JuliaImageRequest;

#[tauri::command]
async fn calc_image(request: JuliaImageRequest) -> String {
    format!(
        "res={}, re={}, im={}",
        request.resolution, request.top_left.re, request.bottom_right.im
    )
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![calc_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
