use crate::fractal::*;
use image::{save_buffer, ColorType};
use num::{complex::Complex64, Complex};
use std::{num::NonZeroUsize, thread, vec};

pub struct FractalImage<Pixel> {
    config: FractalConfig<Pixel>,
    height_px: usize,
    width_px: usize,
    step: f64,
    top_left_bound: Complex64,
    bottom_right_bound: Complex64,
}

impl<Pixel> FractalImage<Pixel>
where
    Pixel: Send + Clone + Sized + 'static + Default,
{
    pub fn new(
        config: FractalConfig<Pixel>,
        domain_top_left_boundary: Complex64,
        domain_bottom_right_boundary: Complex64,
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
            config,
            step,
            width_px,
            height_px,
            top_left_bound: domain_top_left_boundary,
            bottom_right_bound: domain_bottom_right_boundary,
        }
    }

    #[inline]
    fn set_pixel(&self, buffer: &mut Vec<Pixel>, x: usize, y: usize, value: Pixel) {
        let id = self.width_px * y + x;
        buffer[id] = value;
    }

    pub fn render(&self) -> FractalRendered<Pixel> {
        let mut pixels = vec![Pixel::default(); self.width_px * self.height_px];
        let mut real = self.top_left_bound.re;
        for x in 0..self.width_px {
            let mut imag = self.bottom_right_bound.im;
            for y in 0..self.height_px {
                let point = Complex64::new(real, imag);
                let color = (self.config.create_pixel)(point, &self.config);
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

    fn split_work(&self, chunks: usize) -> Vec<FractalImage<Pixel>> {
        let chunk_height = (self.height_px / chunks) + chunks;
        let chunk_bottom_im = |chunk_id: usize| {
            let id = chunk_id as f64;
            let height = chunk_height as f64;
            id * height * self.step + self.bottom_right_bound.im
        };

        let mut jobs = vec![];
        if chunks == 1 {
            return vec![FractalImage {
                config: self.config.clone(),
                ..*self
            }];
        }

        for id in 0..=(chunks - 2) {
            jobs.push(FractalImage::new(
                self.config.clone(),
                Complex64::new(self.top_left_bound.re, chunk_bottom_im(id + 1)),
                Complex64::new(self.bottom_right_bound.re, chunk_bottom_im(id)),
                self.width_px,
            ));
        }

        jobs.push(FractalImage::new(
            self.config.clone(),
            self.top_left_bound,
            Complex64::new(self.bottom_right_bound.re, chunk_bottom_im(chunks - 1)),
            self.width_px,
        ));

        return jobs;
    }

    fn delegate_and_run(&self, chunks: usize) -> FractalRendered<Pixel> {
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

    pub fn render_on_threads(self) -> FractalRendered<Pixel> {
        let mut chunks = thread::available_parallelism()
            .unwrap_or(NonZeroUsize::MIN)
            .get();
        if chunks > 2 {
            chunks -= 1; // Spare one thread for UI
        }
        self.delegate_and_run(chunks.max(4))
    }
}

pub struct FractalRendered<Pixel> {
    pixels: Vec<Pixel>,
    width_px: usize,
}

impl<Pixel> FractalRendered<Pixel> {
    pub fn take_pixels(self) -> Vec<Pixel> {
        self.pixels
    }
}

impl FractalRendered<u8> {
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
}

#[cfg(test)]
mod tests {
    use super::FractalImage;
    use crate::fractal::{self, divergence_to_luma, CreatePixelLuma, FractalConfig};
    use divan;
    use num::complex::Complex64;
    const WIDTH_PX: usize = 512;

    fn new_config(fractal: CreatePixelLuma) -> FractalConfig<u8> {
        FractalConfig::new(
            1024,
            Complex64::new(0.34, 0.08),
            String::new(),
            divergence_to_luma,
            fractal,
        )
    }

    fn mandelbrot() -> FractalImage<u8> {
        FractalImage::new(
            new_config(fractal::mandelbrot),
            Complex64::new(-3.0, 2.0),
            Complex64::new(2.0, -2.0),
            WIDTH_PX,
        )
    }
    fn julia_set() -> FractalImage<u8> {
        FractalImage::new(
            new_config(fractal::julia_set),
            Complex64::new(-2.0, 2.0),
            Complex64::new(2.0, -2.0),
            WIDTH_PX,
        )
    }
    fn burning_ship() -> FractalImage<u8> {
        FractalImage::new(
            new_config(fractal::burning_ship),
            Complex64::new(-2.35, 2.25),
            Complex64::new(2.65, -2.75),
            WIDTH_PX,
        )
    }
    fn newton() -> FractalImage<u8> {
        FractalImage::new(
            new_config(fractal::newton),
            Complex64::new(-3.0, 3.0),
            Complex64::new(3.0, -3.0),
            WIDTH_PX,
        )
    }

    #[divan::bench]
    fn image_vec_serialization(bencher: divan::Bencher) {
        let image = mandelbrot().render().take_pixels();
        bencher.bench(|| {
            serde_json::to_string(&image).unwrap();
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot() {
        mandelbrot().render();
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_julia_set() {
        julia_set().render();
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_burning_ship() {
        burning_ship().render();
    }

    #[divan::bench(sample_count = 3, threads = 1)]
    fn rendered_newton() {
        newton().render();
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threaded(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot().render_on_threads();
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threads_two(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot().delegate_and_run(2);
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threads_three(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot().delegate_and_run(3);
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threads_all(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot().delegate_and_run(6);
        })
    }

    // #[test]
    fn render_default_saves() {
        FractalImage::new(
            new_config(fractal::mandelbrot),
            Complex64::new(-3.0, 2.0),
            Complex64::new(2.0, -2.0),
            1024,
        )
        .render()
        .save_as("default.png".into());
    }

    #[test]
    fn render_threaded_saves() {
        mandelbrot()
            .render_on_threads()
            .save_as("threads.png".into());
    }

    // #[test]
    fn render_two_threads_saves() {
        mandelbrot()
            .delegate_and_run(2)
            .save_as("two-threads.png".into());
    }
}
