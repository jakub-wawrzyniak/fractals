use num::complex::Complex64;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Clone, Copy)]
#[serde(remote = "Complex64")]
struct ComplexDef {
    im: f64,
    re: f64,
}

#[derive(Deserialize, Clone)]
pub struct FractalFragment {
    pub height_px: u32,
    pub width_px: u32,
    #[serde(with = "ComplexDef")]
    pub top_left: Complex64,
    #[serde(with = "ComplexDef")]
    pub bottom_right: Complex64,
}

#[derive(Deserialize, Clone)]
pub enum FractalVariant {
    Newton,
    BurningShip,
    Mandelbrot,
    #[serde(with = "ComplexDef")]
    JuliaSet(Complex64),
}

#[derive(Deserialize, Clone)]
pub struct FractalConfig {
    pub variant: FractalVariant,
    pub max_iterations: u32,
}

#[derive(Deserialize, Clone)]
pub struct TileRequest {
    pub fractal: FractalConfig,
    pub fragment: FractalFragment,
    pub color: String,
}

#[derive(Deserialize, Clone)]
pub struct ExportRequest {
    pub fractal: FractalConfig,
    pub fragment: FractalFragment,
    pub color: String,
    pub filepath: String,
}

#[derive(Serialize, Clone, Copy)]
pub enum ExportResult {
    Done,
    ErrorBadFileType,
    ErrorUnknown,
}
