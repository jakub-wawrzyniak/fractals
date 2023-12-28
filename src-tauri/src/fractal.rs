use num::complex::{Complex64, ComplexFloat};
pub type Luma = image::Luma<u8>;
pub type Rgb = image::Rgb<u8>;
pub type CreatePixel<T> = fn(Complex64, &FractalConfig<T>) -> T;
pub type CreatePixelLuma = fn(Complex64, &FractalConfig<Luma>) -> Luma;
pub type CreatePixelRgb = fn(Complex64, &FractalConfig<Rgb>) -> Rgb;

#[derive(Clone)]
pub struct ColorLUT(pub Option<[Rgb; 256]>);

#[derive(Clone)]
pub struct FractalConfig<Pixel> {
    pub create_pixel: fn(Complex64, &FractalConfig<Pixel>) -> Pixel,
    pub divergence_to_pixel: fn(Complex64, u32, &FractalConfig<Pixel>) -> Pixel,
    pub max_iterations: u32,
    pub color: ColorLUT,
    pub constant: Complex64,
}

pub fn clip_u8(input: f64) -> u8 {
    input.round().max(0.0).min(255.0) as u8
}

fn how_quickly_diverges(last_point: Complex64, iterations: u32) -> f64 {
    let abs = last_point.abs().log2().log2();
    let value = (iterations as f64) + 1.0 - abs;
    value * 6.0
}

pub fn divergence_to_luma<T>(last_point: Complex64, iterations: u32, _: &FractalConfig<T>) -> Luma {
    let luma = how_quickly_diverges(last_point, iterations);
    Luma::from([clip_u8(luma); 1])
}

pub fn divergence_to_rgb(
    last_point: Complex64,
    iterations: u32,
    config: &FractalConfig<Rgb>,
) -> Rgb {
    let luma = divergence_to_luma(last_point, iterations, config);
    let rgb = config.color.0.unwrap()[luma.0[0] as usize];
    rgb
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
