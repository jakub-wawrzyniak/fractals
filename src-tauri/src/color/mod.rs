mod hsl;
mod utils;
use num::complex::Complex64;

use self::hsl::*;
use self::utils::*;
use crate::{
    data::{ColorHex, ColorMethod, Rgb},
    fractal::ComplexItem,
};

struct FractalPoint {
    pub index: f64,
    pub max_index: f64,
    pub value: Complex64,
}

impl FractalPoint {
    pub fn from_item(item: &ComplexItem, max_index: u32) -> Self {
        Self {
            index: item.index.min(max_index) as f64,
            max_index: max_index as f64,
            value: item.value,
        }
    }

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

    fn raw(&self, point: &FractalPoint) -> f64 {
        let mut id = point.index;
        if self.anti_alias {
            id -= point.anti_alias();
        }

        id / 256.0
    }

    fn linear(&self, point: &FractalPoint) -> f64 {
        match self.anti_alias {
            false => point.normalized_no_aa(),
            true => point.normalized_with_aa(),
        }
    }

    fn exponential(&self, point: &FractalPoint, pow: f64) -> f64 {
        let norm = match self.anti_alias {
            false => point.normalized_no_aa(),
            true => point.normalized_with_aa(),
        };
        norm.powf(pow)
    }

    fn stripes(&self, point: &FractalPoint) -> f64 {
        let in_fractal = point.index == point.max_index;
        let point_out_of_bounds = point.index == 0.0;
        if in_fractal || point_out_of_bounds {
            return 0.0;
            // TODO: this could be parametrized
        }
        let aa = point.anti_alias();
        (-aa).powf(3.0)
    }

    pub fn get_pixel(&self, item: &ComplexItem, max_item_id: u32) -> Rgb {
        let point = &FractalPoint::from_item(item, max_item_id);

        use ColorMethod::*;
        let base = match self.method {
            Raw => self.raw(point),
            Linear => self.linear(point),
            Exponential { power } => self.exponential(point, power),
            Stripes => self.stripes(point),
        };

        let luma = base * self.brightness;
        self.gradient.color_for(luma)
    }
}
