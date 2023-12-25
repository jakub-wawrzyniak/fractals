use crate::fractal::GetLumaForPoint;
use image;
use num::Complex;
use std::vec;

pub struct FractalImage {
    height_px: usize,
    width_px: usize,
    step: f64,
    real_min: f64,
    imag_min: f64,
    pixels: Vec<u8>,
    constant: Complex<f64>,
}

impl FractalImage {
    pub fn new(
        constant: Complex<f64>,
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
            constant,
            real_min,
            imag_min,
            step,
            width_px,
            height_px,
            pixels: vec![0; height_px * width_px],
        }
    }

    #[inline]
    fn set_pixel(&mut self, x: usize, y: usize, value: u8) {
        let id = self.width_px * y + x;
        self.pixels[id] = value;
    }

    pub fn render(mut self, fractal: GetLumaForPoint) -> Self {
        let mut real = self.real_min;
        for x in 0..self.width_px {
            let mut imag = self.imag_min;
            for y in 0..self.height_px {
                let point = Complex::new(real, imag);
                let color = fractal(point, &self.constant);
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

#[cfg(test)]
mod tests {
    use super::FractalImage;
    use crate::fractal::mandelbrot;
    use divan;
    use num::Complex;

    fn default_image() -> FractalImage {
        FractalImage::new(
            Complex::new(0.34, 0.08),
            Complex::new(-1.0, 1.5),
            Complex::new(1.0, -1.5),
            512,
        )
    }

    fn default_rendered() -> FractalImage {
        default_image().render(mandelbrot)
    }

    #[divan::bench(sample_count = 20)]
    fn default_tauri_square(bencher: divan::Bencher) {
        bencher.bench(|| default_rendered())
    }

    #[divan::bench]
    fn image_vec_transformation(bencher: divan::Bencher) {
        let image = default_rendered();
        bencher.bench(|| {
            image.take_ui_pixels();
        })
    }

    #[divan::bench]
    fn image_vec_serialization(bencher: divan::Bencher) {
        let image = default_rendered().take_ui_pixels();
        bencher.bench(|| {
            serde_json::to_string(&image).unwrap();
        })
    }

    #[test]
    fn default_image_saves() {
        default_rendered().save_as("default.png".into());
    }
}
