mod hsl;
mod utils;
use self::hsl::*;
use self::utils::*;
use crate::{
    data::{ColorHex, ColorMethod, Rgb},
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
        if self.index == self.max_index {
            return 0.0;
            // TODO: this could be parametrized
        }

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
    gradient: ColorGradient,
    brightness: f64,
    anti_alias: bool,
    method: ColorMethod,
}

impl ColorCreator {
    pub fn new(color: ColorHex, brightness: f64, anti_alias: bool, method: ColorMethod) -> Self {
        Self {
            brightness,
            anti_alias,
            method,
            gradient: ColorGradient::new(
                &hex_to_color(color.hex_start),
                &hex_to_color(color.hex_end),
            ),
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

    fn stripes(&self, item: &ComplexItem) -> f64 {
        let in_fractal = item.index == item.max_index;
        let point_out_of_bounds = item.index == 0.0;
        if in_fractal || point_out_of_bounds {
            return 0.0;
            // TODO: this could be parametrized
        }
        let aa = item.anti_alias();
        (-aa).powf(3.0)
    }

    pub fn get_pixel(&self, item: &ComplexItem) -> Rgb {
        use ColorMethod::*;
        let base = match self.method {
            Raw => self.raw(item),
            Linear => self.linear(item),
            Exponential { power } => self.exponential(item, power),
            Stripes => self.stripes(item),
        };

        let luma = base * self.brightness;
        self.gradient.color_for(luma)
    }
}
