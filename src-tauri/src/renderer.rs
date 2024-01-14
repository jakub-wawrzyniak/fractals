use crate::fractal::*;
use image::ImageBuffer as __ImageBuffer;
use num::{complex::Complex64, Complex};
use std::{mem::size_of, num::NonZeroUsize, thread, vec};

type ImageBuffer<Px> = __ImageBuffer<Px, Vec<u8>>;
pub struct FractalImage<Pixel> {
    config: FractalConfig<Pixel>,
    height_px: u32,
    width_px: u32,
    step: f64,
    top_left_bound: Complex64,
    bottom_right_bound: Complex64,
}

impl<Px> FractalImage<Px>
where
    Px: image::Pixel<Subpixel = u8> + 'static,
{
    pub fn new(
        config: FractalConfig<Px>,
        domain_top_left_boundary: Complex64,
        domain_bottom_right_boundary: Complex64,
        width_px: u32,
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
        let height_px = ((imag_max - imag_min) / step).floor() as u32;

        Self {
            config,
            step,
            width_px,
            height_px,
            top_left_bound: domain_top_left_boundary,
            bottom_right_bound: domain_bottom_right_boundary,
        }
    }

    fn with_height(self, height_px: u32) -> Self {
        Self { height_px, ..self }
    }

    pub fn render(&self) -> ImageBuffer<Px> {
        let mut image = ImageBuffer::<Px>::new(self.width_px as u32, self.height_px as u32);
        let mut real = self.top_left_bound.re;
        for x in 0..self.width_px {
            let mut imag = self.bottom_right_bound.im;
            for y in 0..self.height_px {
                let point = Complex64::new(real, imag);
                let color = (self.config.create_pixel)(point, &self.config);
                image.put_pixel(x, y, color);
                imag += self.step;
            }
            real += self.step;
        }
        image
    }

    fn split_work(&self, chunks: u32) -> Vec<FractalImage<Px>> {
        let chunk_height = self.height_px / chunks;
        let chunk_bottom_im = |chunk_id: u32| {
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
            jobs.push(
                FractalImage::new(
                    self.config.clone(),
                    Complex64::new(self.top_left_bound.re, chunk_bottom_im(id + 1)),
                    Complex64::new(self.bottom_right_bound.re, chunk_bottom_im(id)),
                    self.width_px,
                )
                .with_height(chunk_height),
            );
        }

        jobs.push(
            FractalImage::new(
                self.config.clone(),
                self.top_left_bound,
                Complex64::new(self.bottom_right_bound.re, chunk_bottom_im(chunks - 1)),
                self.width_px,
            )
            .with_height(chunk_height + self.height_px % chunks),
        );

        let computed_height_px: u32 = jobs.iter().map(|j| j.height_px).sum();
        if computed_height_px != self.height_px {
            panic!("Slow down, cowboy");
        }
        return jobs;
    }

    pub fn delegate_and_run(&self, chunks: u32) -> ImageBuffer<Px> {
        let jobs = self.split_work(chunks);
        let mut handles = vec![];
        let mut pixels = vec![];

        for job in jobs {
            handles.push(thread::spawn(move || job.render().into_raw()))
        }

        for handle in handles {
            pixels.append(&mut handle.join().unwrap())
        }
        ImageBuffer::from_raw(self.width_px, self.height_px, pixels).unwrap()
    }

    pub fn render_on_threads(self) -> ImageBuffer<Px> {
        let chunks = thread::available_parallelism()
            .unwrap_or(NonZeroUsize::MIN)
            .get()
            * 4;
        self.delegate_and_run(chunks as u32)
        // Some chunks are mutch faster to compute than others, if we
        // make more threads than CPU cores, the load will average out
    }
}

pub fn take_and_flip<Px: image::Pixel<Subpixel = u8>>(buffer: ImageBuffer<Px>) -> Vec<u8> {
    let width = buffer.width() as usize;
    buffer
        .into_raw()
        .chunks(width * size_of::<Px>())
        .into_iter()
        .rev()
        .flatten()
        .map(|e| *e)
        .collect()
}

#[cfg(test)]
mod tests {
    use super::FractalImage;
    use crate::{
        api::create_color_lut,
        fractal::{
            self, divergence_to_luma, divergence_to_rgb, ColorLUT, CreatePixel, CreatePixelLuma,
            CreatePixelRgb, FractalConfig, Luma, Rgba,
        },
        renderer::take_and_flip,
    };
    use divan;
    use num::complex::Complex64;

    const WIDTH_PX: u32 = 512;
    type GetConfig<Pixel> = fn(CreatePixel<Pixel>) -> FractalConfig<Pixel>;

    fn config_grayscale(fractal: CreatePixelLuma) -> FractalConfig<Luma> {
        FractalConfig {
            max_iterations: 1024,
            constant: Complex64::new(0.34, 0.08),
            color: ColorLUT(None),
            divergence_to_pixel: divergence_to_luma,
            create_pixel: fractal,
        }
    }

    fn config_color(fractal: CreatePixelRgb) -> FractalConfig<Rgba> {
        FractalConfig {
            max_iterations: 1024,
            constant: Complex64::new(0.34, 0.08),
            color: create_color_lut(image::Rgba([255, 0, 0, 0])),
            divergence_to_pixel: divergence_to_rgb,
            create_pixel: fractal,
        }
    }

    fn mandelbrot<Pixel: image::Pixel<Subpixel = u8> + 'static>(
        get_config: GetConfig<Pixel>,
    ) -> FractalImage<Pixel> {
        FractalImage::new(
            get_config(fractal::mandelbrot),
            Complex64::new(-3.0, 2.0),
            Complex64::new(2.0, -2.0),
            WIDTH_PX,
        )
    }
    fn julia_set<Pixel: image::Pixel<Subpixel = u8> + 'static>(
        get_config: GetConfig<Pixel>,
    ) -> FractalImage<Pixel> {
        FractalImage::new(
            get_config(fractal::julia_set),
            Complex64::new(-2.0, 2.0),
            Complex64::new(2.0, -2.0),
            WIDTH_PX,
        )
    }
    fn burning_ship<Pixel: image::Pixel<Subpixel = u8> + 'static>(
        get_config: GetConfig<Pixel>,
    ) -> FractalImage<Pixel> {
        FractalImage::new(
            get_config(fractal::burning_ship),
            Complex64::new(-2.35, 2.25),
            Complex64::new(2.65, -2.75),
            WIDTH_PX,
        )
    }
    fn newton<Pixel: image::Pixel<Subpixel = u8> + 'static>(
        get_config: GetConfig<Pixel>,
    ) -> FractalImage<Pixel> {
        FractalImage::new(
            get_config(fractal::newton),
            Complex64::new(-3.0, 3.0),
            Complex64::new(3.0, -3.0),
            WIDTH_PX,
        )
    }

    #[divan::bench]
    fn image_vec_serialization(bencher: divan::Bencher) {
        let image = mandelbrot(config_color).render().into_raw();
        bencher.bench(|| {
            serde_json::to_string(&image).unwrap();
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot() {
        mandelbrot(config_color).render();
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_gray() {
        mandelbrot(config_grayscale).render();
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_julia_set() {
        julia_set(config_color).render();
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_burning_ship() {
        burning_ship(config_color).render();
    }

    #[divan::bench(sample_count = 3, threads = 1)]
    fn rendered_newton() {
        newton(config_color).render();
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threaded(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot(config_color).render_on_threads();
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threads_24(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot(config_color).delegate_and_run(24);
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threads_three(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot(config_color).delegate_and_run(3);
        })
    }

    #[divan::bench(sample_count = 10, threads = 1)]
    fn rendered_mandelbrot_threads_all(bencher: divan::Bencher) {
        bencher.bench(|| {
            mandelbrot(config_color).delegate_and_run(6);
        })
    }

    #[test]
    fn renders_buffer_with_expected_size() {
        let rendered = mandelbrot(config_color).render();
        let (width, height) = rendered.dimensions();
        let full_size = width * height * 4; // 4 bytes for each pixel
        assert_eq!(full_size as usize, rendered.into_raw().len());
    }

    #[test]
    fn size_is_same_after_flipping() {
        let rendered = mandelbrot(config_color).render();
        let (width, height) = rendered.dimensions();
        let expected_size = width * height * 4; // 4 bytes for each pixel

        let got_size = take_and_flip(rendered).len() as u32;
        assert_eq!(expected_size, got_size);
    }

    #[test]
    fn render_grayscale_saves() {
        FractalImage::new(
            config_grayscale(fractal::mandelbrot),
            Complex64::new(-3.0, 2.0),
            Complex64::new(2.0, -2.0),
            1024,
        )
        .render()
        .save("./gray.png".to_owned())
        .unwrap();
    }

    #[test]
    fn render_color_saves() {
        FractalImage::new(
            config_color(fractal::mandelbrot),
            Complex64::new(-3.0, 2.0),
            Complex64::new(2.0, -2.0),
            1024,
        )
        .render()
        .save("./color.png".to_owned())
        .unwrap();
    }

    #[test]
    fn render_threaded_grayscale_saves() {
        mandelbrot(config_grayscale)
            .render_on_threads()
            .save("./threads.png".to_owned())
            .unwrap();
    }

    #[test]
    fn render_threaded_colors_saves() {
        mandelbrot(config_color)
            .render_on_threads()
            .save("./threads.png".to_owned())
            .unwrap();
    }

    #[test]
    fn render_two_threads_saves() {
        mandelbrot(config_color)
            .delegate_and_run(2)
            .save("./two-threads.png".to_owned())
            .unwrap();
    }
}
