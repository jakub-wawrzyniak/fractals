use crate::{
    fractal::{self, clip_u8, ColorLUT, CreatePixel, FractalConfig, Luma, Rgba, NOT_TRANSPARENT},
    renderer::FractalImage,
};
use num::complex::Complex64;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Clone, Copy)]
pub struct Point {
    pub imaginary: f64,
    pub real: f64,
}

impl Into<Complex64> for Point {
    fn into(self) -> Complex64 {
        Complex64::new(self.real, self.imaginary)
    }
}

#[derive(Deserialize, Clone)]
pub struct FractalTileRequest {
    pub constant: Option<Point>,
    pub fractal_variant: FractalVariant,
    pub max_iterations: u32,
    pub top_left: Point,
    pub bottom_right: Point,
    pub width_px: f64,
    pub color: String,
}

#[derive(Deserialize, Clone)]
pub struct ExportFractalRequest {
    pub constant: Option<Point>,
    pub fractal_variant: FractalVariant,
    pub max_iterations: u32,
    pub top_left: Point,
    pub bottom_right: Point,
    pub width_px: f64,
    pub color: String,
    pub filepath: String,
}

#[derive(Deserialize, Clone, Copy)]
pub enum FractalVariant {
    Mandelbrot,
    JuliaSet,
    BurningShip,
    Newton,
}

impl<T> Into<CreatePixel<T>> for FractalVariant {
    fn into(self) -> CreatePixel<T> {
        match self {
            Self::Mandelbrot => fractal::mandelbrot,
            Self::JuliaSet => fractal::julia_set,
            Self::BurningShip => fractal::burning_ship,
            Self::Newton => fractal::newton,
        }
    }
}

fn blend_overlay(bottom: u8, top: u8) -> u8 {
    let bottom = bottom as f64 / 256.0;
    let top = top as f64 / 256.0;
    let blended = if bottom < 0.5 {
        2.0 * bottom * top
    } else {
        1.0 - 2.0 * (1.0 - bottom) * (1.0 - top)
    };
    return clip_u8(blended * 256.0);
}

pub fn create_color_lut(color: Rgba) -> ColorLUT {
    let black = image::Rgba::<u8>([0, 0, 0, 0]);
    let mut lut = [black; 256];
    for luma in 0..=255 {
        let r = blend_overlay(luma, color.0[0]);
        let g = blend_overlay(luma, color.0[1]);
        let b = blend_overlay(luma, color.0[2]);
        lut[luma as usize] = image::Rgba([r, g, b, NOT_TRANSPARENT]);
    }
    ColorLUT(Some(lut))
}

fn hex_to_color(hex: String) -> Rgba {
    let bytes = hex::decode(hex[1..=6].to_owned()).unwrap();
    let color = [bytes[0], bytes[1], bytes[2], NOT_TRANSPARENT];
    image::Rgba(color)
}

impl From<String> for ColorLUT {
    fn from(value: String) -> Self {
        let color = hex_to_color(value);
        create_color_lut(color)
    }
}

impl From<FractalTileRequest> for FractalConfig<Rgba> {
    fn from(value: FractalTileRequest) -> Self {
        FractalConfig {
            max_iterations: value.max_iterations,
            constant: value
                .constant
                .unwrap_or(Point {
                    imaginary: 0.0,
                    real: 0.0,
                })
                .into(),
            color: create_color_lut(hex_to_color(value.color)),
            divergence_to_pixel: fractal::divergence_to_rgb,
            create_pixel: value.fractal_variant.into(),
        }
    }
}

impl From<ExportFractalRequest> for FractalConfig<Rgba> {
    fn from(value: ExportFractalRequest) -> Self {
        FractalConfig {
            max_iterations: value.max_iterations,
            constant: value
                .constant
                .unwrap_or(Point {
                    imaginary: 0.0,
                    real: 0.0,
                })
                .into(),
            color: create_color_lut(hex_to_color(value.color)),
            divergence_to_pixel: fractal::divergence_to_rgb,
            create_pixel: value.fractal_variant.into(),
        }
    }
}

impl From<FractalTileRequest> for FractalImage<Rgba> {
    fn from(request: FractalTileRequest) -> Self {
        Self::new(
            request.clone().into(),
            request.top_left.into(),
            request.bottom_right.into(),
            request.width_px as u32,
        )
    }
}

impl From<ExportFractalRequest> for FractalImage<Rgba> {
    fn from(request: ExportFractalRequest) -> Self {
        Self::new(
            request.clone().into(),
            request.top_left.into(),
            request.bottom_right.into(),
            request.width_px as u32,
        )
    }
}

#[derive(Serialize, Clone, Copy)]
pub enum ExportResult {
    Done,
    ErrorBadFileType,
    ErrorUnknown,
}

#[cfg(test)]
mod tests {
    use super::hex_to_color;

    #[test]
    fn parses_colors() {
        let input = "#ff0000".to_owned();
        let [r, g, b, _] = hex_to_color(input).0;
        assert_eq!(r, 255);
        assert_eq!(g, 0);
        assert_eq!(b, 0);
    }

    #[test]
    #[should_panic]
    fn panics_on_invalid_hex() {
        let input = "#ff000".to_owned();
        hex_to_color(input);
    }
}
