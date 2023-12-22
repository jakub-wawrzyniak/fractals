// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

pub mod fractals;
use fractals::{JuliaImage, JuliaImageRequest};

#[tauri::command]
fn calc_image(request: JuliaImageRequest) -> Vec<u8> {
    let out = JuliaImage::from(request).compute().take_pixels();
    println!(
        "re={}, im={}",
        request.bottom_right.real, request.bottom_right.imaginary
    );
    println!("{}", out.len());
    out
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![calc_image])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
