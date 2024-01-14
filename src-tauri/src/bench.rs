#![allow(dead_code)]
mod api;
mod fractal;
mod renderer;

// use api::create_color_lut;
// use fractal::{divergence_to_rgb, CreatePixel, CreatePixelRgb, FractalConfig, Rgba};
// use num::complex::Complex64;
// use renderer::FractalImage;
// type GetConfig<Pixel> = fn(CreatePixel<Pixel>) -> FractalConfig<Pixel>;

// fn config_color(fractal: CreatePixelRgb) -> FractalConfig<Rgba> {
//     FractalConfig {
//         max_iterations: 1024,
//         constant: Complex64::new(0.34, 0.08),
//         color: create_color_lut(image::Rgba([255, 0, 0, 0])),
//         divergence_to_pixel: divergence_to_rgb,
//         create_pixel: fractal,
//     }
// }

// fn mandelbrot<Pixel: image::Pixel<Subpixel = u8> + 'static>(
//     get_config: GetConfig<Pixel>,
// ) -> FractalImage<Pixel> {
//     FractalImage::new(
//         get_config(fractal::mandelbrot),
//         Complex64::new(-3.0, 2.0),
//         Complex64::new(2.0, -2.0),
//         1024,
//     )
// }

fn main() {
    divan::main();
    // mandelbrot(config_color).delegate_and_run(6);
}
