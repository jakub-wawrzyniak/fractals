use num::complex::{Complex64, ComplexFloat};
pub type CreatePixel<T> = fn(Complex64, &FractalConfig<T>) -> T;
pub type CreatePixelLuma = fn(Complex64, &FractalConfig<u8>) -> u8;

#[derive(Clone)]
pub struct FractalConfig<Pixel> {
    pub create_pixel: fn(Complex64, &FractalConfig<Pixel>) -> Pixel,
    divergence_to_pixel: fn(Complex64, u32, &FractalConfig<Pixel>) -> Pixel,
    max_iterations: u32,
    color_hex: String,
    constant: Complex64,
}

impl<Pixel> FractalConfig<Pixel> {
    pub fn new(
        max_iterations: u32,
        constant: Complex64,
        color_hex: String,
        divergence_to_pixel: fn(Complex64, u32, &FractalConfig<Pixel>) -> Pixel,
        create_pixel: fn(Complex64, &FractalConfig<Pixel>) -> Pixel,
    ) -> Self {
        Self {
            create_pixel,
            divergence_to_pixel,
            max_iterations,
            color_hex,
            constant,
        }
    }
}

pub fn divergence_to_luma(last_point: Complex64, iterations: u32, _: &FractalConfig<u8>) -> u8 {
    let abs = last_point.abs().log2().log2();
    let value: f64 = (iterations as f64) + 1.0 - abs;
    (value * 6.0).floor().max(0.0).min(256.0) as u8
}

fn in_bounds(point: &Complex64, radius: f64) -> bool {
    let distance = point.re * point.re + point.im * point.im;
    return distance < radius;
}

pub fn mandelbrot<Pixel>(point: Complex64, config: &FractalConfig<Pixel>) -> Pixel {
    let mut iteration = 0;
    let mut current = Complex64::new(0.0, 0.0);
    while iteration < config.max_iterations && in_bounds(&current, 9.0) {
        current = current.powi(2) + point;
        iteration += 1;
    }
    (config.divergence_to_pixel)(current, iteration, config)
}

pub fn julia_set<Pixel>(point: Complex64, config: &FractalConfig<Pixel>) -> Pixel {
    const ESCAPE_RADIUS: f64 = 2.0;
    let mut iteration = 0;
    let mut current = point;
    while iteration < config.max_iterations && current.norm() < ESCAPE_RADIUS {
        current = current.powi(2) + config.constant;
        iteration += 1;
    }
    (config.divergence_to_pixel)(current, iteration, config)
}

pub fn burning_ship<Pixel>(point: Complex64, config: &FractalConfig<Pixel>) -> Pixel {
    const ESCAPE_RADIUS: f64 = 3.0;
    let mut iteration = 0;
    let mut current = Complex64::new(0.0, 0.0);
    while iteration < config.max_iterations && current.norm() < ESCAPE_RADIUS {
        current = Complex64::new(current.re.abs(), current.im.abs()).powi(2) + point;
        iteration += 1;
    }
    (config.divergence_to_pixel)(current, iteration, config)
}

pub fn newton<Pixel>(point: Complex64, config: &FractalConfig<Pixel>) -> Pixel {
    const ESCAPE_RADIUS: f64 = 2.0;
    let mut iteration = 0;
    let mut current = point;
    while iteration < config.max_iterations && current.norm() < ESCAPE_RADIUS {
        let nominator = current.powi(3) * 2.0 + 1.0;
        let denominator = current.powi(2) * 3.0;
        current = nominator / denominator;
        iteration += 1;
    }
    (config.divergence_to_pixel)(current, iteration, config)
}
