use crate::{
    fractal::{self, CreatePixel, FractalConfig},
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

impl From<FractalRequestLuma> for FractalConfig<u8> {
    fn from(value: FractalRequestLuma) -> Self {
        FractalConfig::new(
            value.max_iterations,
            value
                .constant
                .unwrap_or(Point {
                    imaginary: 0.0,
                    real: 0.0,
                })
                .into(),
            String::new(),
            fractal::divergence_to_luma,
            value.fractal_variant.into(),
        )
    }
}

impl From<FractalRequestLuma> for FractalImage<u8> {
    fn from(request: FractalRequestLuma) -> Self {
        Self::new(
            request.into(),
            request.top_left.into(),
            request.bottom_right.into(),
            request.width_px as usize,
        )
    }
}
