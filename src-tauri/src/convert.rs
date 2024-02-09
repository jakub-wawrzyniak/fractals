use crate::color::hex_to_color;
use crate::data::{ColorConfig, ExportRequest, FractalConfig};
use crate::fractal::*;
use crate::renderer::FractalImage;
use crate::{color::ColorCreator, data::TileRequest};

impl From<ColorConfig> for ColorCreator {
    fn from(value: ColorConfig) -> Self {
        ColorCreator::new(
            hex_to_color(value.color),
            value.brightness,
            value.anti_alias,
            value.method,
        )
    }
}

impl From<FractalConfig> for Fractal {
    fn from(value: FractalConfig) -> Self {
        Fractal::new(value.max_iterations, value.variant)
    }
}

impl From<TileRequest> for FractalImage {
    fn from(value: TileRequest) -> Self {
        FractalImage::new(value.fractal.into(), value.fragment, value.color.into())
    }
}

impl From<ExportRequest> for FractalImage {
    fn from(value: ExportRequest) -> Self {
        FractalImage::new(value.fractal.into(), value.fragment, value.color.into())
    }
}
