use crate::data::ExportRequest;
use crate::fractal::*;
use crate::renderer::{FractalImage, ImageBuffer};
use crate::{color::ColorCreator, data::TileRequest};

impl TileRequest {
    pub fn run(self) -> ImageBuffer {
        let max_iterations = self.fractal.max_iterations;
        let variant = self.fractal.variant;
        let color = ColorCreator::from_hex(self.color, crate::color::ColorMethod::Linear);
        let fractal = Fractal::new(max_iterations, variant);
        FractalImage::new(fractal, self.fragment, color).render_for_ui()
    }
}

impl ExportRequest {
    pub fn run(self) -> ImageBuffer {
        let max_iterations = self.fractal.max_iterations;
        let variant = self.fractal.variant;
        let color = ColorCreator::from_hex(self.color, crate::color::ColorMethod::Linear);
        let fractal = Fractal::new(max_iterations, variant);
        FractalImage::new(fractal, self.fragment, color).render_on_threads()
    }
}
