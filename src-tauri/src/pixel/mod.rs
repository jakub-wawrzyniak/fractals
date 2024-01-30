mod utils;
use self::utils::*;
pub use self::utils::{Luma, Rgb};
use crate::fractal::ComplexItem;

pub trait PixelCreator {
    type Pixel;
    fn get_pixel(&self, item: ComplexItem) -> Self::Pixel;
}

#[derive(Clone, Copy)]
pub struct PixelLuma;
impl PixelCreator for PixelLuma {
    type Pixel = Luma;
    fn get_pixel(&self, item: ComplexItem) -> Luma {
        let id = item.index as f64;
        let max_id = item.max_index as f64;
        if id == max_id {
            return Luma::from([0; 1]);
        }
        let anti_alias = (item.value.norm().log2() / max_id.log2()).log2();
        // ^the last log base depends on the power in the fractal equation

        let float_id = id - anti_alias;
        let brightness = 4.0;
        let luma = (float_id / max_id) * 256.0 * brightness;
        Luma::from([clip(luma); 1])
    }
}

#[derive(Clone, Copy)]
pub struct PixelRgb {
    color_lut: ColorLUT,
}

impl PixelRgb {
    pub fn new(color: Rgb) -> Self {
        Self {
            color_lut: create_color_lut(color),
        }
    }
    pub fn from_hex(hex: String) -> Self {
        let color = hex_to_color(hex);
        Self::new(color)
    }
}

impl PixelCreator for PixelRgb {
    type Pixel = Rgb;
    fn get_pixel(&self, item: ComplexItem) -> Rgb {
        let luma = PixelLuma.get_pixel(item);
        let rgb = self.color_lut[luma.0[0] as usize];
        rgb
    }
}
