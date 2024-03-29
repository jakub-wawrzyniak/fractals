mod utils;
pub use self::utils::hex_to_color;
use self::utils::*;
use crate::{
    data::{ColorMethod, Rgb},
    fractal::ComplexItem,
};

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

#[derive(Clone, Copy)]
pub struct ColorCreator {
    color: Rgb,
    brightness: f64,
    anti_alias: bool,
    method: ColorMethod,
}

impl ColorCreator {
    pub const fn new(color: Rgb, brightness: f64, anti_alias: bool, method: ColorMethod) -> Self {
        Self {
            color,
            brightness,
            anti_alias,
            method,
        }
    }

    fn raw(&self, item: &ComplexItem) -> f64 {
        let mut id = item.index;
        if self.anti_alias {
            id -= item.anti_alias();
        }

        id / 256.0
    }

    fn linear(&self, item: &ComplexItem) -> f64 {
        match self.anti_alias {
            false => item.normalized_no_aa(),
            true => item.normalized_with_aa(),
        }
    }

    fn exponential(&self, item: &ComplexItem, pow: f64) -> f64 {
        let norm = match self.anti_alias {
            false => item.normalized_no_aa(),
            true => item.normalized_with_aa(),
        };
        norm.powf(pow)
    }

    pub fn get_pixel(&self, item: &ComplexItem) -> Rgb {
        use ColorMethod::*;
        let base = match self.method {
            Raw => self.raw(item),
            Linear => self.linear(item),
            Exponential { power } => self.exponential(item, power),
        };

        let luma = base * self.brightness;
        blend_with_color(luma, &self.color)
    }
}
