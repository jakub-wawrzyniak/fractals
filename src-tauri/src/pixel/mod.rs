mod utils;
use self::utils::*;
pub use self::utils::{Luma, Rgb};
use crate::fractal::ComplexItem;

impl ComplexItem {
    /// Returns a value between 0 and 1, provided self.index < self.max_index
    /// When subtracted from self.index, you get 'real iteration number' (see: wikipedia)
    /// TODO: Add wiki link
    fn anti_alias(&self) -> f64 {
        (self.value.norm().log2() / self.max_index.log2()).log2()
        // TODO: ^the last log base depends on the power in the
        // fractal equation so technically... to be corrected
    }

    fn normalized_no_aa(&self) -> f64 {
        self.index / self.max_index
    }

    fn normalized_with_aa(&self) -> f64 {
        if self.index == self.max_index {
            return 0.0;
            // TODO: this could be parametrized
        }

        let anti_alias = self.anti_alias() / self.max_index;
        self.normalized_no_aa() - anti_alias
    }
}

pub trait PixelCreator {
    type Pixel;
    fn get_pixel(&self, item: ComplexItem) -> Self::Pixel;
}

#[derive(Clone, Copy)]
pub struct PixelLuma {
    brightness: f64,
}

impl PixelLuma {
    pub fn new() -> Self {
        Self { brightness: 4.0 }
    }
}

impl PixelCreator for PixelLuma {
    type Pixel = Luma;
    fn get_pixel(&self, item: ComplexItem) -> Luma {
        let norm = item.normalized_with_aa();
        let luma = norm * self.brightness;
        Luma::from([clip(luma * 256.0); 1])
    }
}

#[derive(Clone, Copy)]
pub struct PixelRgb {
    brightness: f64,
    color: Rgb,
}

impl PixelRgb {
    pub fn new(color: Rgb) -> Self {
        Self {
            color,
            brightness: 2.0,
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
        let norm = item.normalized_no_aa();
        let luma = norm * self.brightness;
        blend_with_color(luma, &self.color)
    }
}
