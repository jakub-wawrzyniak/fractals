use num::complex::Complex64;
use serde::{Deserialize, Serialize};
pub type Rgb = image::Rgb<u8>;

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

#[derive(Deserialize, Clone, Copy)]
#[serde(tag = "type")]
pub enum ColorMethod {
    Raw,
    Linear,
    Stripes,
    Exponential { power: f64 },
}

#[derive(Deserialize, Clone)]
pub struct ColorHex {
    pub hex_start: String,
    pub hex_end: String,
}

#[derive(Deserialize, Clone)]
pub struct ColorConfig {
    pub color: ColorHex,
    pub brightness: f64,
    pub anti_alias: bool,
    pub method: ColorMethod,
}

#[derive(Deserialize, Clone, Copy)]
#[serde(tag = "type")]
pub enum FractalVariant {
    Newton,
    BurningShip,
    Mandelbrot,
    JuliaSet {
        #[serde(with = "ComplexDef")]
        constant: Complex64,
    },
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
    pub color: ColorConfig,
}

#[derive(Deserialize, Clone)]
pub struct ExportRequest {
    pub fractal: FractalConfig,
    pub fragment: FractalFragment,
    pub color: ColorConfig,
    pub filepath: String,
}

#[derive(Serialize, Clone, Copy)]
pub enum ExportResult {
    Done,
    ErrorBadFileType,
    ErrorUnknown,
}
