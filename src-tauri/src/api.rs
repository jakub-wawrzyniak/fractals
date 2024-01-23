use crate::fractal::*;
use crate::pixel::{PixelRgb, Rgb};
use crate::renderer::{FractalFragment, FractalImage, ImageBuffer};
use num::complex::Complex64;
use serde::{Deserialize, Serialize};

#[derive(Deserialize, Clone, Copy)]
struct Point {
    imaginary: f64,
    real: f64,
}

impl Into<Complex64> for Point {
    fn into(self) -> Complex64 {
        Complex64::new(self.real, self.imaginary)
    }
}

impl From<FractalFragment<Point>> for FractalFragment<Complex64> {
    fn from(value: FractalFragment<Point>) -> Self {
        FractalFragment {
            top_left: value.top_left.into(),
            bottom_right: value.bottom_right.into(),
            height_px: value.height_px.into(),
            width_px: value.width_px.into(),
        }
    }
}

#[derive(Deserialize, Clone, Copy)]
enum FractalVariant {
    Mandelbrot,
    JuliaSet,
    BurningShip,
    Newton,
}

#[derive(Deserialize, Clone)]
struct FractalConfig {
    variant: FractalVariant,
    constant: Option<Point>,
    max_iterations: u32,
}

#[derive(Deserialize, Clone)]
pub struct TileRequest {
    fractal: FractalConfig,
    fragment: FractalFragment<Point>,
    color: String,
}

#[derive(Deserialize, Clone)]
pub struct ExportRequest {
    fractal: FractalConfig,
    fragment: FractalFragment<Point>,
    color: String,
    pub filepath: String,
}

impl TileRequest {
    pub fn run(self) -> ImageBuffer<Rgb> {
        use FractalVariant::*;
        let max_iterations = self.fractal.max_iterations;
        let fragment: FractalFragment<Complex64> = self.fragment.into();
        let pixel_creator = PixelRgb::from_hex(self.color);
        match self.fractal.variant {
            Mandelbrot => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalMandelbrot { max_iterations },
            })
            .render_for_ui(),
            BurningShip => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalBurningShip { max_iterations },
            })
            .render_for_ui(),
            JuliaSet => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalJulia {
                    max_iterations,
                    constant: self.fractal.constant.unwrap().into(),
                },
            })
            .render_for_ui(),
            Newton => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalNewton { max_iterations },
            })
            .render_for_ui(),
        }
    }
}

impl ExportRequest {
    pub fn run(self) -> ImageBuffer<Rgb> {
        use FractalVariant::*;
        let max_iterations = self.fractal.max_iterations;
        let fragment: FractalFragment<Complex64> = self.fragment.into();
        let pixel_creator = PixelRgb::from_hex(self.color);
        match self.fractal.variant {
            Mandelbrot => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalMandelbrot { max_iterations },
            })
            .render_on_threads(),
            BurningShip => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalBurningShip { max_iterations },
            })
            .render_on_threads(),
            JuliaSet => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalJulia {
                    max_iterations,
                    constant: self.fractal.constant.unwrap().into(),
                },
            })
            .render_on_threads(),
            Newton => (FractalImage {
                fragment,
                pixel_creator,
                fractal: FractalNewton { max_iterations },
            })
            .render_on_threads(),
        }
    }
}

#[derive(Serialize, Clone, Copy)]
pub enum ExportResult {
    Done,
    ErrorBadFileType,
    ErrorUnknown,
}
