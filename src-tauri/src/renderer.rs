use crate::{fractal, pixel::PixelCreator};
use image::{ImageBuffer as __ImageBuffer, PixelWithColorType};
use num::complex::Complex64;
use serde::Deserialize;
use std::{mem::size_of, num::NonZeroUsize, thread, vec};

pub type ImageBuffer<Px> = __ImageBuffer<Px, Vec<u8>>;

#[derive(Deserialize, Clone)]
pub struct FractalFragment<Point> {
    pub height_px: u32,
    pub width_px: u32,
    pub top_left: Point,
    pub bottom_right: Point,
}

#[derive(Clone)]
pub struct FractalImage<Fractal, GetPixel> {
    pub fractal: Fractal,
    pub fragment: FractalFragment<Complex64>,
    pub pixel_creator: GetPixel,
}

impl<Fractal, GetPixel> FractalImage<Fractal, GetPixel>
where
    Fractal: fractal::Fractal + Send + Copy + 'static,
    GetPixel: PixelCreator + Send + Copy + 'static,
    GetPixel::Pixel: image::Pixel<Subpixel = u8> + 'static,
{
    fn pixel_size(&self) -> f64 {
        let width = self.fragment.width_px as f64;
        let real_min = self.fragment.top_left.re;
        let real_max = self.fragment.bottom_right.re;
        (real_max - real_min) / width
    }

    pub fn render(&self) -> ImageBuffer<GetPixel::Pixel> {
        let step = self.pixel_size();
        let size = &self.fragment;
        let mut image = ImageBuffer::<GetPixel::Pixel>::new(size.width_px, size.height_px);
        let mut real = size.top_left.re;
        for x in 0..size.width_px {
            let mut imag = size.bottom_right.im;
            for y in 0..size.height_px {
                let point = Complex64::new(real, imag);
                let divergence = self.fractal.eval(point);
                let pixel = self.pixel_creator.get_pixel(divergence);
                image.put_pixel(x, y, pixel);
                imag += step;
            }
            real += step;
        }
        image
    }

    fn split_work(&self, chunks: u32) -> Vec<Self> {
        if chunks == 1 {
            return vec![FractalImage { ..self.clone() }];
        }

        let step = self.pixel_size();
        let size = self.fragment.clone();
        let mut jobs = vec![];

        let chunk_height = size.height_px / chunks;
        let chunk_bottom_im = |chunk_id: u32| {
            let id = chunk_id as f64;
            let height = chunk_height as f64;
            id * height * step + size.bottom_right.im
        };

        for id in 0..=(chunks - 2) {
            jobs.push(FractalImage {
                fragment: FractalFragment {
                    width_px: size.width_px,
                    height_px: chunk_height,
                    top_left: Complex64::new(size.top_left.re, chunk_bottom_im(id + 1)),
                    bottom_right: Complex64::new(size.bottom_right.re, chunk_bottom_im(id)),
                },
                ..self.clone()
            });
        }

        jobs.push(FractalImage {
            fragment: FractalFragment {
                height_px: chunk_height + size.height_px % chunks,
                bottom_right: Complex64::new(size.bottom_right.re, chunk_bottom_im(chunks - 1)),
                ..size
            },
            ..self.clone()
        });

        let computed_height_px: u32 = jobs.iter().map(|j| j.fragment.height_px).sum();
        if computed_height_px != size.height_px {
            panic!("Slow down, cowboy");
        }
        return jobs;
    }

    fn delegate_and_run(&self, chunks: u32) -> ImageBuffer<GetPixel::Pixel> {
        let jobs = self.split_work(chunks);
        let mut handles = vec![];
        let mut pixels = vec![];

        for job in jobs {
            handles.push(thread::spawn(move || job.render().into_raw()))
        }

        for handle in handles {
            pixels.append(&mut handle.join().unwrap())
        }

        let size = &self.fragment;
        ImageBuffer::from_raw(size.width_px, size.height_px, pixels).unwrap()
    }

    pub fn render_on_threads(self) -> ImageBuffer<GetPixel::Pixel> {
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

pub fn into_data_url<Px: image::Pixel<Subpixel = u8> + PixelWithColorType>(
    raw: ImageBuffer<Px>,
) -> String {
    let (width, height) = (raw.width(), raw.height());
    let flipped = take_and_flip(raw);
    let img = ImageBuffer::<Px>::from_vec(width, height, flipped).unwrap();

    use base64::prelude::*;
    use std::io::Cursor;
    let mut buffer = Vec::with_capacity(img.len());
    let mut cursor = Cursor::new(&mut buffer);
    img.write_to(&mut cursor, image::ImageOutputFormat::Png)
        .unwrap();
    let data = BASE64_STANDARD.encode(buffer);
    format!("data:image/png;base64,{data}")
}

#[cfg(test)]
mod tests {
    use crate::{
        fractal::{FractalBurningShip, FractalJulia, FractalMandelbrot, FractalNewton},
        pixel::{PixelLuma, PixelRgb},
    };

    use super::{into_data_url, FractalFragment, FractalImage};
    use divan;
    use num::{complex::Complex64, Complex};

    const FRAGMENT: FractalFragment<Complex64> = FractalFragment {
        width_px: 512,
        height_px: 512,
        top_left: Complex::new(-2.5, 2.5),
        bottom_right: Complex::new(2.5, -2.5),
    };

    fn mandelbrot() -> FractalImage<FractalMandelbrot, PixelLuma> {
        FractalImage {
            fragment: FRAGMENT,
            pixel_creator: PixelLuma,
            fractal: FractalMandelbrot {
                max_iterations: 1024,
            },
        }
    }
    fn julia_set() -> FractalImage<FractalJulia, PixelRgb> {
        FractalImage {
            fragment: FRAGMENT,
            pixel_creator: PixelRgb::from_hex("#ff0000".into()),
            fractal: FractalJulia {
                max_iterations: 1024,
                constant: Complex64::new(0.34, 0.08),
            },
        }
    }
    fn burning_ship() -> FractalImage<FractalBurningShip, PixelRgb> {
        FractalImage {
            fragment: FRAGMENT,
            pixel_creator: PixelRgb::from_hex("#ff0000".into()),
            fractal: FractalBurningShip {
                max_iterations: 1024,
            },
        }
    }
    fn newton() -> FractalImage<FractalNewton, PixelRgb> {
        FractalImage {
            fragment: FRAGMENT,
            pixel_creator: PixelRgb::from_hex("#ff0000".into()),
            fractal: FractalNewton {
                max_iterations: 1024,
            },
        }
    }

    #[divan::bench]
    fn image_vec_serialization(bencher: divan::Bencher) {
        let image = mandelbrot().render().into_raw();
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
    fn rendered_mandelbrot_threaded() {
        mandelbrot().render_on_threads();
    }

    #[divan::bench]
    fn flip_and_encode(bencher: divan::Bencher) {
        let img = mandelbrot().render();
        bencher.bench(|| {
            let copy = img.clone();
            let data = into_data_url(copy);
            serde_json::to_string(&data).unwrap();
        })
    }

    #[test]
    fn renders_buffer_with_expected_size() {
        let rendered = mandelbrot().render();
        let (width, height) = rendered.dimensions();
        let full_size = width * height;
        assert_eq!(full_size as usize, rendered.into_raw().len());
    }

    #[test]
    fn size_is_same_after_flipping() {
        let rendered = mandelbrot().render();
        let (width, height) = rendered.dimensions();
        let expected_size = width * height;

        let got_size = super::take_and_flip(rendered).len() as u32;
        assert_eq!(expected_size, got_size);
    }

    #[test]
    #[should_panic]
    fn encodes_png() {
        use base64::prelude::*;
        use std::io::Cursor;

        let img = mandelbrot().render();
        let mut buffer = Vec::with_capacity(img.len());
        let mut cursor = Cursor::new(&mut buffer);
        img.write_to(&mut cursor, image::ImageOutputFormat::Jpeg(70))
            .unwrap();

        println!("{}", BASE64_STANDARD.encode(buffer).len());
    }

    #[test]
    fn render_mandelbrot_saves() {
        mandelbrot().render().save("./gray.png".to_owned()).unwrap();
    }

    #[test]
    fn render_julia_saves() {
        julia_set().render().save("./color.png".to_owned()).unwrap();
    }

    #[test]
    fn render_threaded_saves() {
        burning_ship()
            .render_on_threads()
            .save("./threads.png".to_owned())
            .unwrap();
    }
}
