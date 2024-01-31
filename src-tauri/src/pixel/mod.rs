mod utils;
use self::utils::*;
pub use self::utils::{Luma, Rgb};
use crate::fractal::ComplexItem;

fn normalize_index(item: ComplexItem) -> f64 {
    let id = item.index as f64;
    let max_id = item.max_index as f64;
    if id == max_id {
        return 0.0;
    }
    let anti_alias = (item.value.norm().log2() / max_id.log2()).log2();
    // ^the last log base depends on the power in the fractal equation

    let float_id = id - anti_alias;
    let brightness = 4.0 / 256.0;
    float_id * brightness
}

pub trait PixelCreator {
    type Pixel;
    fn get_pixel(&self, item: ComplexItem) -> Self::Pixel;
}

#[derive(Clone, Copy)]
pub struct PixelLuma;
impl PixelCreator for PixelLuma {
    type Pixel = Luma;
    fn get_pixel(&self, item: ComplexItem) -> Luma {
        let luma = normalize_index(item);
        Luma::from([clip(luma * 256.0); 1])
    }
}

#[derive(Clone, Copy)]
pub struct PixelRgb {
    color: Rgb,
}

impl PixelRgb {
    pub fn new(color: Rgb) -> Self {
        Self { color }
    }
    pub fn from_hex(hex: String) -> Self {
        let color = hex_to_color(hex);
        Self::new(color)
    }
}

impl PixelCreator for PixelRgb {
    type Pixel = Rgb;
    fn get_pixel(&self, item: ComplexItem) -> Rgb {
        let luma = normalize_index(item);
        blend_with_color(luma, &self.color)
    }
}
