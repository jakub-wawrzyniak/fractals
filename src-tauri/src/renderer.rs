use crate::{
    color::ColorCreator,
    data::{FractalFragment, Rgb},
    fractal::{ComplexItem, Fractal},
};
use image::ImageBuffer as __ImageBuffer;
use num::complex::Complex64;
use rayon::iter::{IntoParallelIterator, ParallelIterator};
use std::{num::NonZeroUsize, thread};

pub type ImageBuffer = __ImageBuffer<Rgb, Vec<u8>>;

#[derive(Clone)]
enum RenderState {
    Todo,
    Done(Vec<ComplexItem>),
    // Dirty(Vec<u8>)
}

#[derive(Clone)]
pub struct FractalImage {
    fractal: Fractal,
    fragment: FractalFragment,
    state: RenderState,
}

impl FractalImage {
    pub fn new(fractal: Fractal, fragment: FractalFragment) -> Self {
        Self {
            fractal,
            fragment,
            state: RenderState::Todo,
        }
    }

    fn pixel_size(&self) -> f64 {
        let width = self.fragment.width_px as f64;
        let real_min = self.fragment.top_left.re;
        let real_max = self.fragment.bottom_right.re;
        (real_max - real_min) / width
    }

    fn pixel_index(&self, x: u32, y: u32) -> usize {
        (y * self.fragment.width_px + x) as usize
    }

    pub fn render(&mut self) {
        let step = self.pixel_size();
        let size = &self.fragment;
        self.state = RenderState::Done(
            (0..size.height_px)
                .into_par_iter()
                .map(|y| {
                    let mut row = Vec::with_capacity(size.width_px as usize);
                    for x in 0..size.width_px {
                        let imag = size.top_left.im - step * y.to_owned() as f64;
                        let real = size.top_left.re + step * x.to_owned() as f64;
                        let point = Complex64::new(real, imag);
                        row.push(self.fractal.eval(point));
                    }
                    row
                })
                .flatten()
                .collect(),
        );
    }

    pub fn apply_color(&self, color: &ColorCreator) -> ImageBuffer {
        let FractalFragment {
            height_px,
            width_px,
            ..
        } = &self.fragment;
        let rendered = match &self.state {
            RenderState::Done(data) => data,
            RenderState::Todo => panic!("Cannot apply color if the fractal is not rendered"),
        };

        ImageBuffer::from_fn(*width_px, *height_px, |x, y| {
            let item = &rendered[self.pixel_index(x, y)];
            color.get_pixel(item, self.fractal.max_item_id())
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

pub fn into_data_url(img: ImageBuffer) -> String {
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
        FractalImage::new(Fractal::new(1024, Mandelbrot), FRAGMENT)
    }

    fn julia_set() -> FractalImage {
        FractalImage::new(
            Fractal::new(
                1024,
                JuliaSet {
                    constant: Complex64::new(0.34, 0.08),
                },
            ),
            FRAGMENT,
        )
    }

    fn burning_ship() -> FractalImage {
        FractalImage::new(Fractal::new(1024, BurningShip), FRAGMENT)
    }

    fn newton() -> FractalImage {
        FractalImage::new(Fractal::new(1024, Newton), FRAGMENT)
    }

    fn render(mut img: FractalImage) -> ImageBuffer {
        img.render();
        img.apply_color(&get_color())
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_mandelbrot() {
        render(mandelbrot());
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_julia_set() {
        render(julia_set());
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_burning_ship() {
        render(burning_ship());
    }

    #[divan::bench(sample_count = 30)]
    fn rendered_newton() {
        render(newton());
    }

    #[divan::bench]
    fn encode_png(bencher: divan::Bencher) {
        let img = render(mandelbrot());
        bencher.bench(|| {
            let data = into_data_url(img.clone());
            serde_json::to_string(&data).unwrap();
        })
    }

    #[test]
    fn renders_buffer_with_expected_size() {
        use std::mem::size_of;
        let rendered = render(mandelbrot());
        let (width, height) = rendered.dimensions();
        let full_size = width * height * size_of::<super::Rgb>() as u32;
        assert_eq!(full_size as usize, rendered.into_raw().len());
    }

    #[test]
    fn encodes_png() {
        use base64::prelude::*;
        use std::io::Cursor;

        let img = render(mandelbrot());
        let mut buffer = Vec::with_capacity(img.len());
        let mut cursor = Cursor::new(&mut buffer);
        img.write_to(&mut cursor, image::ImageOutputFormat::Jpeg(70))
            .unwrap();

        println!("{}", BASE64_STANDARD.encode(buffer).len());
    }

    #[test]
    fn render_mandelbrot_saves() {
        let img = render(mandelbrot());
        img.save("./gray.png").unwrap();
    }

    #[test]
    fn render_julia_saves() {
        let img = render(mandelbrot());
        img.save("./color.png").unwrap();
    }
}
