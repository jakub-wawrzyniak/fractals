use num::{complex::ComplexFloat, Complex};
use serde::Deserialize;

const MAX_ITERATION: u32 = 100;
const ESCAPE_RADIUS: f64 = 7.0;

pub type FractalNextValue = fn(Complex<f64>, &Complex<f64>) -> Complex<f64>;

fn normalize_divergence(last_point: Complex<f64>, iterations: u32) -> u8 {
    let Complex { im, re } = last_point;
    let abs = (im.powi(2) + re.powi(2)).log10().log10();
    let value = (iterations as f64) + 1.0 - abs / 2.0_f64.log10();
    (value * 20.0).floor().max(0.0) as u8
}

pub fn how_quickly_diverges(
    start: Complex<f64>,
    constant: &Complex<f64>,
    next_value: FractalNextValue,
) -> u8 {
    let mut iteration = 0;
    let mut current: Complex<f64> = start.to_owned();
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        current = next_value(current, constant);
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}

pub fn mandelbrot_next(current: Complex<f64>, constant: &Complex<f64>) -> Complex<f64> {
    current.powi(2) + constant
}

pub fn burning_ship_next(current: Complex<f64>, constant: &Complex<f64>) -> Complex<f64> {
    let sum = Complex::new(current.re.abs(), current.im.abs());
    sum.powi(2) + constant
}

pub fn newton_next(current: Complex<f64>, _: &Complex<f64>) -> Complex<f64> {
    let nominator = current.powi(3) * 2.0 + 1.0;
    let denominator = current.powi(2) * 3.0;
    nominator / denominator
}

#[derive(Deserialize, Clone, Copy)]
pub enum Fractal {
    Mandelbrot,
    BurningShip,
    Newton,
}

impl Into<FractalNextValue> for Fractal {
    fn into(self) -> FractalNextValue {
        match self {
            Self::Mandelbrot => mandelbrot_next,
            Self::BurningShip => burning_ship_next,
            Self::Newton => newton_next,
        }
    }
}
