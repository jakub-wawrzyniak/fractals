use image;
use num::Complex;
use std::vec;

type Point = Complex<f64>;

struct JuliaSet {
    escape_radius: f64,
    constant: Point,
}

impl JuliaSet {
    fn new(constant: Point) -> Self {
        let discriminant: f64 = 1.0 - 4.0 * constant.norm();
        let escape_radius = 1.0 + discriminant.sqrt();
        Self {
            escape_radius,
            constant,
        }
    }

    fn next_value(&self, this_value: Point) -> Point {
        this_value.powi(2) + self.constant
    }

    fn normalize_divergence(last_point: Point, iterations: i32) -> u8 {
        let Point { im, re } = last_point;
        let abs = (im.powi(2) + re.powi(2)).log10().log10();
        let value = (iterations as f64) + 1.0 - abs / 2.0_f64.log10();
        if value < 0.0 {
            return 0;
        }
        (value * 20.0).floor() as u8
    }

    fn how_quickly_diverges(&self, start: Point) -> u8 {
        let max_iteration = 1_000;
        let mut iteration = 0;
        let mut current = start;
        while iteration < max_iteration && start.norm() < self.escape_radius {
            current = self.next_value(current);
            iteration += 1;
        }
        JuliaSet::normalize_divergence(current, iteration)
    }
}

struct JuliaImage {
    height_px: usize,
    width_px: usize,
    step: f64,
    real_min: f64,
    imag_min: f64,
    pixels: Vec<u8>,
}

impl JuliaImage {
    fn new(
        domain_top_left_boundary: Point,
        domain_bottom_right_boundary: Point,
        resolution: u32,
    ) -> Self {
        let Point {
            re: real_min,
            im: imag_max,
        } = domain_top_left_boundary;
        let Point {
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

    fn example() -> Self {
        Self::new(Complex::new(-1.0, 1.5), Complex::new(1.0, -1.5), 100)
    }

    fn set_pixel(&mut self, x: usize, y: usize, value: u8) {
        let id = self.width_px * x + y;
        self.pixels[id] = value;
    }

    fn compute(mut self) -> Self {
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

    pub fn save(&self) {
        image::save_buffer(
            "out.png",
            &self.pixels,
            self.width_px as u32,
            self.height_px as u32,
            image::ColorType::L8,
        )
        .unwrap();
    }
}

fn main() {
    JuliaImage::example().compute().save();
}
