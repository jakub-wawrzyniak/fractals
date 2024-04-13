use crate::{
    color::ColorCreator,
    data::{FractalFragment, Rgb},
    fractal::Fractal,
};
use image::ImageBuffer as __ImageBuffer;
use num::complex::Complex64;
use std::{mem::size_of, num::NonZeroUsize, thread};

pub type ImageBuffer = __ImageBuffer<Rgb, Vec<u8>>;

#[derive(Clone)]
pub struct FractalImage {
    fractal: Fractal,
    fragment: FractalFragment,
    color: ColorCreator,
}

impl FractalImage {
    pub fn new(fractal: Fractal, fragment: FractalFragment, color: ColorCreator) -> Self {
        Self {
            fractal,
            fragment,
            color,
        }
    }

    fn pixel_size(&self) -> f64 {
        let width = self.fragment.width_px as f64;
        let real_min = self.fragment.top_left.re;
        let real_max = self.fragment.bottom_right.re;
        (real_max - real_min) / width
    }

    pub fn render(&self) -> ImageBuffer {
        let step = self.pixel_size();
        let size = &self.fragment;
        ImageBuffer::from_par_fn(size.width_px, size.height_px, |x, y| {
            let imag = size.bottom_right.im + step * y as f64;
            let real = size.top_left.re + step * x as f64;
            let point = Complex64::new(real, imag);
            let divergence = self.fractal.eval(point);
            self.color.get_pixel(&divergence)
        })
    }

    pub fn init_threadpool() {
        let all_threads = thread::available_parallelism()
            .unwrap_or(NonZeroUsize::MIN)
            .get();
        let will_use_threads = (0.7 * all_threads as f64).floor().max(1.0) as usize;
        // When all available threads are used, the app stutters visibly.
        // I intend to spare some computational power for the UI and WebGL.
        rayon::ThreadPoolBuilder::new()
            .num_threads(will_use_threads)
            .build_global()
            .expect("Error during thread pool init");
    }
}

pub fn take_and_flip(buffer: ImageBuffer) -> Vec<u8> {
    let width = buffer.width() as usize;
    buffer
        .into_raw()
        .chunks(width * size_of::<Rgb>())
        .rev()
        .flatten()
        .copied()
        .collect()
}

pub fn into_data_url(raw: ImageBuffer) -> String {
    let (width, height) = (raw.width(), raw.height());
    let flipped = take_and_flip(raw);
    let img = ImageBuffer::from_vec(width, height, flipped).unwrap();

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
    use super::*;
    use crate::data::*;
    use num::{complex::Complex64, Complex};
    use FractalVariant::*;

    const FRAGMENT: FractalFragment = FractalFragment {
        width_px: 512,
        height_px: 512,
        top_left: Complex::new(-2.5, 2.5),
        bottom_right: Complex::new(2.5, -2.5),
    };

    fn get_color() -> ColorCreator {
        ColorCreator::new(
            ColorHex {
                hex_start: "#ff0000".to_owned(),
                hex_end: "#FFFF00".to_owned(),
            },
            4.0,
            true,
            ColorMethod::Linear,
        )
    }

    fn mandelbrot() -> FractalImage {
        FractalImage {
            color: get_color(),
            fragment: FRAGMENT,
            fractal: Fractal::new(1024, Mandelbrot),
        }
    }
    fn julia_set() -> FractalImage {
        FractalImage {
            color: get_color(),
            fragment: FRAGMENT,
            fractal: Fractal::new(
                1024,
                JuliaSet {
                    constant: Complex64::new(0.34, 0.08),
                },
            ),
        }
    }
    fn burning_ship() -> FractalImage {
        FractalImage {
            fragment: FRAGMENT,
            color: get_color(),
            fractal: Fractal::new(1024, BurningShip),
        }
    }

    fn newton() -> FractalImage {
        FractalImage {
            fragment: FRAGMENT,
            color: get_color(),
            fractal: Fractal::new(1024, Newton),
        }
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_mandelbrot() {
        mandelbrot().render();
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_julia_set() {
        julia_set().render();
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_burning_ship() {
        burning_ship().render();
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_newton() {
        newton().render();
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
        let full_size = width * height * super::size_of::<super::Rgb>() as u32;
        assert_eq!(full_size as usize, rendered.into_raw().len());
    }

    #[test]
    fn size_is_same_after_flipping() {
        let rendered = mandelbrot().render();
        let (width, height) = rendered.dimensions();
        let expected_size = width * height * super::size_of::<super::Rgb>() as u32;

        let got_size = super::take_and_flip(rendered).len() as u32;
        assert_eq!(expected_size, got_size);
    }

    #[test]
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
        mandelbrot().render().save("./gray.png").unwrap();
    }

    #[test]
    fn render_julia_saves() {
        julia_set().render().save("./color.png").unwrap();
    }
}
