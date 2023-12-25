use num::{complex::ComplexFloat, Complex};

const MAX_ITERATION: u32 = 64;
const ESCAPE_RADIUS: f64 = 7.0;

pub type GetLumaForPoint = fn(Complex<f64>, &Complex<f64>) -> u8;

fn normalize_divergence(last_point: Complex<f64>, iterations: u32) -> u8 {
    let Complex { im, re } = last_point;
    let abs = (im.powi(2) + re.powi(2)).log10().log10();
    let value = (iterations as f64) + 1.0 - abs / 2.0_f64.log10();
    (value * 20.0).floor().max(0.0) as u8
}

pub fn mandelbrot(point: Complex<f64>, _: &Complex<f64>) -> u8 {
    let mut iteration = 0;
    let mut current = Complex::new(0.0, 0.0);
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        current = current.powi(2) + point;
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}

pub fn julia_set(point: Complex<f64>, constant: &Complex<f64>) -> u8 {
    let mut iteration = 0;
    let mut current = point;
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        current = current.powi(2) + constant;
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}

pub fn burning_ship(point: Complex<f64>, _: &Complex<f64>) -> u8 {
    let mut iteration = 0;
    let mut current = Complex::new(0.0, 0.0);
    while iteration < MAX_ITERATION && current.norm() < ESCAPE_RADIUS {
        current = Complex::new(current.re.abs(), current.im.abs()).powi(2) + point;
        iteration += 1;
    }
    normalize_divergence(current, iteration)
}

pub fn newton(point: Complex<f64>, _: &Complex<f64>) -> u8 {
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
