use image;
use num::Complex;
use serde::Deserialize;
use std::vec;

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
pub struct JuliaImageRequest {
    pub top_left: Point,
    pub bottom_right: Point,
    pub width_px: f64,
}

struct JuliaSet {
    escape_radius: f64,
    constant: Complex<f64>,
}

impl JuliaSet {
    const MAX_ITERATION: u32 = 100;
    fn new(constant: Complex<f64>) -> Self {
        // let discriminant: f64 = 1.0 - 4.0 * constant.norm();
        let escape_radius = 10.0;
        Self {
            escape_radius,
            constant,
        }
    }

    fn next_value(&self, this_value: Complex<f64>) -> Complex<f64> {
        this_value.powi(2) + self.constant
    }

    fn normalize_divergence(last_point: Complex<f64>, iterations: u32) -> u8 {
        let Complex { im, re } = last_point;
        let abs = (im.powi(2) + re.powi(2)).log10().log10();
        let value = (iterations as f64) + 1.0 - abs / 2.0_f64.log10();
        (value * 20.0).floor().max(0.0) as u8
    }

    fn how_quickly_diverges(&self, start: Complex<f64>) -> u8 {
        let mut iteration = 0;
        let mut current = start;
        while iteration < JuliaSet::MAX_ITERATION && current.norm() < self.escape_radius {
            current = self.next_value(current);
            iteration += 1;
        }
        JuliaSet::normalize_divergence(current, iteration)
    }
}

pub struct JuliaImage {
    height_px: usize,
    width_px: usize,
    step: f64,
    real_min: f64,
    imag_min: f64,
    pixels: Vec<u8>,
}

impl JuliaImage {
    pub fn new(
        domain_top_left_boundary: Complex<f64>,
        domain_bottom_right_boundary: Complex<f64>,
        resolution: u32,
    ) -> Self {
        let Complex {
            re: real_min,
            im: imag_max,
        } = domain_top_left_boundary;
        let Complex {
            re: real_max,
            im: imag_min,
        } = domain_bottom_right_boundary;
        let step = (real_max - real_min) / (resolution as f64);
        let width_px = ((real_max - real_min) / step).floor() as usize;
        let height_px = ((imag_max - imag_min) / step).floor() as usize;

        Self {
            real_min,
            imag_min,
            step,
            width_px,
            height_px,
            pixels: vec![0; height_px * width_px],
        }
    }

    pub fn example() -> Self {
        Self::new(Complex::new(-1.0, 1.5), Complex::new(1.0, -1.5), 100)
    }

    #[inline]
    fn set_pixel(&mut self, x: usize, y: usize, value: u8) {
        let id = self.width_px * y + x;
        self.pixels[id] = value;
    }

    pub fn compute(mut self) -> Self {
        let constant = Complex::new(0.34, 0.08);
        let julia = JuliaSet::new(constant);

        let mut real = self.real_min;
        for x in 0..self.width_px {
            let mut imag = self.imag_min;
            for y in 0..self.height_px {
                let point = Complex::new(real, imag);
                let color = julia.how_quickly_diverges(point);
                self.set_pixel(x, y, color);
                imag += self.step;
            }
            real += self.step;
        }
        self
    }

    pub fn save_as(&self, name: String) {
        let result = image::save_buffer(
            format!("./{name}"),
            &self.pixels,
            self.width_px as u32,
            self.height_px as u32,
            image::ColorType::L8,
        );
        match result {
            Err(e) => eprintln!("{}", e.to_string()),
            Ok(_) => (),
        };
    }

    pub fn save(&self) {
        self.save_as("out.png".into());
    }

    pub fn take_pixels(self) -> Vec<u8> {
        self.pixels
    }

    pub fn take_ui_pixels(&self) -> Vec<u8> {
        self.pixels
            .chunks(self.width_px)
            .rev()
            .flatten()
            .map(|el| el.clone())
            .collect()
    }
}

impl From<JuliaImageRequest> for JuliaImage {
    fn from(request: JuliaImageRequest) -> Self {
        Self::new(
            request.top_left.into(),
            request.bottom_right.into(),
            request.width_px as u32,
        )
    }
}

#[cfg(test)]
mod tests {
    use super::JuliaImage;
    use divan;

    fn default_image() -> JuliaImage {
        let unit = 2.5;
        let top = num::Complex::new(-unit, unit);
        let bottom = num::Complex::new(unit, -unit);
        JuliaImage::new(top, bottom, 1024)
    }

    fn default_tile() -> JuliaImage {
        let unit = 2.5;
        let top = num::Complex::new(-unit, unit);
        let bottom = num::Complex::new(0.0, 0.0);
        JuliaImage::new(top, bottom, 512)
    }

    #[divan::bench(sample_count = 20)]
    fn default_tauri_square(bencher: divan::Bencher) {
        bencher.bench(|| {
            default_image().compute();
        })
    }

    #[divan::bench]
    fn image_vec_transformation(bencher: divan::Bencher) {
        let image = default_image().compute();
        bencher.bench(|| {
            image.take_ui_pixels();
        })
    }

    #[divan::bench]
    fn image_vec_serialization(bencher: divan::Bencher) {
        let image = default_image().compute().take_ui_pixels();
        bencher.bench(|| {
            serde_json::to_string(&image).unwrap();
        })
    }

    #[test]
    fn example_saves() {
        JuliaImage::example()
            .compute()
            .save_as("example.png".into());
    }
    #[test]
    fn default_image_saves() {
        default_image().compute().save_as("default.png".into());
    }
    #[test]
    fn default_tile_saves() {
        default_tile().compute().save_as("tile.png".into());
    }
}
