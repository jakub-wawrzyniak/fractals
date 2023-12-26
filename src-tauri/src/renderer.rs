use crate::fractal::GetLumaForPoint;
use image;
use num::Complex;
use std::{num::NonZeroUsize, thread, vec};

pub struct FractalImage {
    height_px: usize,
    width_px: usize,
    step: f64,
    constant: Complex<f64>,
    top_left_bound: Complex<f64>,
    bottom_right_bound: Complex<f64>,
    fractal: GetLumaForPoint,
}

impl FractalImage {
    pub fn new(
        fractal: GetLumaForPoint,
        constant: Complex<f64>,
        domain_top_left_boundary: Complex<f64>,
        domain_bottom_right_boundary: Complex<f64>,
        width_px: usize,
    ) -> Self {
        let Complex {
            re: real_min,
            im: imag_max,
        } = domain_top_left_boundary;
        let Complex {
            re: real_max,
            im: imag_min,
        } = domain_bottom_right_boundary;
        let step = (real_max - real_min) / (width_px as f64);
        let height_px = ((imag_max - imag_min) / step).floor() as usize;

        Self {
            constant,
            step,
            width_px,
            height_px,
            fractal,
            top_left_bound: domain_top_left_boundary,
            bottom_right_bound: domain_bottom_right_boundary,
        }
    }

    #[inline]
    fn set_pixel(&self, buffer: &mut Vec<u8>, x: usize, y: usize, value: u8) {
        let id = self.width_px * y + x;
        buffer[id] = value;
    }

    pub fn render(&self) -> FractalRendered {
        let mut pixels = vec![0; self.height_px * self.width_px];
        let mut real = self.top_left_bound.re;
        for x in 0..self.width_px {
            let mut imag = self.bottom_right_bound.im;
            for y in 0..self.height_px {
                let point = Complex::new(real, imag);
                let color = (self.fractal)(point, &self.constant);
                self.set_pixel(&mut pixels, x, y, color);
                imag += self.step;
            }
            real += self.step;
        }
        FractalRendered {
            pixels,
            width_px: self.width_px,
        }
    }

    fn split_work(&self, chunks: usize) -> Vec<FractalImage> {
        let chunk_height = (self.height_px / chunks) + chunks;
        let chunk_bottom_im = |chunk_id: usize| {
            let id = chunk_id as f64;
            let height = chunk_height as f64;
            id * height * self.step + self.bottom_right_bound.im
        };

        let mut jobs = vec![];
        if chunks == 1 {
            return vec![FractalImage { ..*self }];
        }

        for id in 0..=(chunks - 2) {
            jobs.push(FractalImage::new(
                self.fractal,
                self.constant,
                Complex::new(self.top_left_bound.re, chunk_bottom_im(id + 1)),
                Complex::new(self.bottom_right_bound.re, chunk_bottom_im(id)),
                self.width_px,
            ));
        }

        jobs.push(FractalImage::new(
            self.fractal,
            self.constant,
            self.top_left_bound,
            Complex::new(self.bottom_right_bound.re, chunk_bottom_im(chunks - 1)),
            self.width_px,
        ));

        return jobs;
    }

    fn delegate_and_run(&self, chunks: usize) -> FractalRendered {
        let jobs = self.split_work(chunks);
        let mut handles = vec![];
        let mut pixels = vec![];

        for job in jobs {
            handles.push(thread::spawn(move || job.render().take_pixels()))
        }

        for handle in handles {
            pixels.append(&mut handle.join().unwrap())
        }

        FractalRendered {
            pixels,
            width_px: self.width_px,
        }
    }

    pub fn render_on_threads(self) -> FractalRendered {
        let mut chunks = thread::available_parallelism()
            .unwrap_or(NonZeroUsize::MIN)
            .get();
        if chunks > 2 {
            chunks -= 1; // Spare one thread for UI
        }
        self.delegate_and_run(chunks)
    }
}

pub struct FractalRendered {
    pixels: Vec<u8>,
    width_px: usize,
}

impl FractalRendered {
    pub fn save_as(&self, name: String) {
        let height_px = self.pixels.len() / self.width_px;
        let result = image::save_buffer(
            format!("./{name}"),
            &self.pixels,
            self.width_px as u32,
            height_px as u32,
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
    use super::{FractalImage, FractalRendered};
    use crate::fractal;
    use divan;
    use num::Complex;

    fn mandelbrot() -> FractalImage {
        FractalImage::new(
            fractal::mandelbrot,
            Complex::new(0.34, 0.08),
            Complex::new(-3.0, 2.0),
            Complex::new(2.0, -2.0),
            1024,
        )
    }

    fn default_threads() -> FractalRendered {
        mandelbrot().render_on_threads()
    }

    #[divan::bench]
    fn image_vec_transformation(bencher: divan::Bencher) {
        let image = rendered_default();
        bencher.bench(|| {
            image.take_ui_pixels();
        })
    }

    #[divan::bench]
    fn image_vec_serialization(bencher: divan::Bencher) {
        let image = rendered_default().take_ui_pixels();
        bencher.bench(|| {
            serde_json::to_string(&image).unwrap();
        })
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_default() -> FractalRendered {
        mandelbrot().render()
    }

    #[divan::bench(sample_count = 30, threads = false)]
    fn rendered_threaded(bencher: divan::Bencher) {
        bencher.bench(|| {
            default_threads();
        })
    }

    #[divan::bench(sample_count = 30, threads = false)]
    fn rendered_threads_two(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot().delegate_and_run(2);
        })
    }

    #[test]
    fn render_default_saves() {
        rendered_default().save_as("default.png".into());
    }

    #[test]
    fn render_threaded_saves() {
        default_threads().save_as("threads.png".into());
    }

    #[test]
    fn render_two_threads_saves() {
        mandelbrot()
            .delegate_and_run(1)
            .save_as("two-threads.png".into());
    }
}
