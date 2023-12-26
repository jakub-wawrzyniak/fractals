use crate::{fractal::*, renderer::FractalImage};
use num::Complex;
use serde::Deserialize;

#[derive(Deserialize, Clone, Copy)]
pub struct Point {
    pub imaginary: f64,
    pub real: f64,
}

impl Into<Complex<f64>> for Point {
    fn into(self) -> Complex<f64> {
        Complex::new(self.real, self.imaginary)
    }
}

#[derive(Deserialize, Clone, Copy)]
pub struct FractalRequest {
    pub constant: Point,
    pub fractal_variant: Fractal,
    pub top_left: Point,
    pub bottom_right: Point,
    pub width_px: f64,
}

#[derive(Deserialize, Clone, Copy)]
pub enum Fractal {
    Mandelbrot,
    JuliaSet,
    BurningShip,
    Newton,
}

impl Into<GetLumaForPoint> for Fractal {
    fn into(self) -> GetLumaForPoint {
        match self {
            Self::Mandelbrot => mandelbrot,
            Self::JuliaSet => julia_set,
            Self::BurningShip => burning_ship,
            Self::Newton => newton,
        }
    }
}

impl From<FractalRequest> for FractalImage {
    fn from(request: FractalRequest) -> Self {
        Self::new(
            request.fractal_variant.into(),
            request.constant.into(),
            request.top_left.into(),
            request.bottom_right.into(),
            request.width_px as usize,
        )
    }
}
