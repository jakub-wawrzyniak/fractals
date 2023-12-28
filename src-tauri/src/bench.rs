mod api;
#[allow(dead_code)]
mod fractal;
mod renderer;

// use fractal::{divergence_to_luma, CreatePixelLuma, FractalConfig};
// use num::complex::Complex64;
// use renderer::FractalImage;
// fn new_config(fractal: CreatePixelLuma) -> FractalConfig<u8> {
//     FractalConfig::new(
//         1024,
//         Complex64::new(0.34, 0.08),
//         String::new(),
//         divergence_to_luma,
//         fractal,
//     )
// }
// fn mandelbrot() -> FractalImage<u8> {
//     FractalImage::new(
//         new_config(fractal::mandelbrot),
//         Complex64::new(-3.0, 2.0),
//         Complex64::new(2.0, -2.0),
//         1024,
//     )
// }

fn main() {
    divan::main();
    // for _ in 0..50 {
    //     mandelbrot().render_on_threads();
    // }
}
