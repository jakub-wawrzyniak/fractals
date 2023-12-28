use crate::{
    fractal::{self, clip_u8, ColorLUT, CreatePixel, FractalConfig, Luma, Rgb},
    renderer::FractalImage,
};
use num::complex::Complex64;
use serde::Deserialize;

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

#[derive(Deserialize, Clone, Copy)]
pub struct FractalRequestLuma {
    pub constant: Option<Point>,
    pub fractal_variant: FractalVariant,
    pub max_iterations: u32,
    pub top_left: Point,
    pub bottom_right: Point,
    pub width_px: f64,
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
    // let (top, bottom) = (bottom, top);
    let bottom = bottom as f64 / 256.0;
    let top = top as f64 / 256.0;
    let blended = if bottom < 0.5 {
        2.0 * bottom * top
    } else {
        1.0 - 2.0 * (1.0 - bottom) * (1.0 - top)
    };
    return clip_u8(blended * 256.0);
}

pub fn create_color_lut(color: Rgb) -> ColorLUT {
    let black = image::Rgb::<u8>([0, 0, 0]);
    let mut lut = [black; 256];
    for luma in 0..=255 {
        let r = blend_overlay(luma, color.0[0]);
        let g = blend_overlay(luma, color.0[1]);
        let b = blend_overlay(luma, color.0[2]);
        lut[luma as usize] = image::Rgb([r, g, b]);
    }
    ColorLUT(Some(lut))
}

fn hex_to_color(hex: String) -> Rgb {
    let bytes = hex::decode(hex[1..=6].to_owned()).unwrap();
    let color = [bytes[0], bytes[1], bytes[2]];
    image::Rgb(color)
}

impl From<String> for ColorLUT {
    fn from(value: String) -> Self {
        let color = hex_to_color(value);
        create_color_lut(color)
    }
}

impl From<FractalRequestLuma> for FractalConfig<Luma> {
    fn from(value: FractalRequestLuma) -> Self {
        FractalConfig {
            max_iterations: value.max_iterations,
            constant: value
                .constant
                .unwrap_or(Point {
                    imaginary: 0.0,
                    real: 0.0,
                })
                .into(),
            color: ColorLUT(None),
            divergence_to_pixel: fractal::divergence_to_luma,
            create_pixel: value.fractal_variant.into(),
        }
    }
}

impl From<FractalRequestLuma> for FractalImage<Luma> {
    fn from(request: FractalRequestLuma) -> Self {
        Self::new(
            request.into(),
            request.top_left.into(),
            request.bottom_right.into(),
            request.width_px as u32,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::hex_to_color;

    #[test]
    fn parses_colors() {
        let input = "#ff0000".to_owned();
        let [r, g, b] = hex_to_color(input).0;
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
