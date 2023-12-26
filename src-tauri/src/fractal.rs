use num::{complex::ComplexFloat, Complex};
pub type GetLumaForPoint = fn(Complex<f64>, &Complex<f64>) -> u8;

const MAX_ITERATION: u32 = 1024;

fn normalize_divergence(last_point: Complex<f64>, iterations: u32) -> u8 {
    let abs = last_point.abs().log2().log2();
    let value: f64 = (iterations as f64) + 1.0 - abs;
    (value * 12.0).floor().max(0.0).min(256.0) as u8
}

fn normalize_reverse(last_point: Complex<f64>, iterations: u32) -> u8 {
    let abs = last_point.abs().log2().log2();
    let value: f64 = abs - (iterations as f64) - 1.0 + 256.0;
    (value * 12.0).floor().max(0.0).min(256.0) as u8
}

pub fn mandelbrot(point: Complex<f64>, _: &Complex<f64>) -> u8 {
    const ESCAPE_RADIUS: f64 = 3.0;
    let mut iteration = 0;
    let mut current = Complex::new(0.0, 0.0);
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        current = current.powi(2) + point;
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}

pub fn julia_set(point: Complex<f64>, constant: &Complex<f64>) -> u8 {
    const ESCAPE_RADIUS: f64 = 2.0;
    let mut iteration = 0;
    let mut current = point;
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        current = current.powi(2) + constant;
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}

pub fn burning_ship(point: Complex<f64>, _: &Complex<f64>) -> u8 {
    const ESCAPE_RADIUS: f64 = 3.0;
    let mut iteration = 0;
    let mut current = Complex::new(0.0, 0.0);
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        current = Complex::new(current.re.abs(), current.im.abs()).powi(2) + point;
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}

pub fn newton(point: Complex<f64>, _: &Complex<f64>) -> u8 {
    const ESCAPE_RADIUS: f64 = 2.0;
    let mut iteration = 0;
    let mut current = point;
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        let nominator = current.powi(3) * 2.0 + 1.0;
        let denominator = current.powi(2) * 3.0;
        current = nominator / denominator;
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}
