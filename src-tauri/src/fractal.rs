use crate::data::FractalVariant;
use num::complex::Complex64;

pub struct ComplexItem {
    pub index: f64,
    pub max_index: f64,
    // Those^ values will eventually be converted to f64,
    // so for simplicity let's do it once, in Fractal::eval
    pub value: Complex64,
}

#[derive(Clone)]
pub struct Fractal {
    max_item_id: u32,
    constant: Option<Complex64>,
    next_item: fn(&Fractal, Complex64, &Complex64) -> Complex64,
}

impl Fractal {
    const ESCAPE_RADIUS: f64 = 8.0;
    pub fn new(max_item_id: u32, variant: FractalVariant) -> Self {
        use FractalVariant::*;
        Self {
            max_item_id,
            constant: match variant {
                JuliaSet { constant } => Some(constant),
                _ => None,
            },
            next_item: match variant {
                BurningShip => Self::next_in_burning_ship,
                Mandelbrot => Self::next_in_mandelbrot,
                Newton => Self::next_in_newton,
                JuliaSet { constant: _ } => Self::next_in_julia,
            },
        }
    }

    fn next_in_mandelbrot(&self, current_item: Complex64, point: &Complex64) -> Complex64 {
        current_item.powi(2) + point
    }

    fn next_in_julia(&self, current_item: Complex64, _: &Complex64) -> Complex64 {
        current_item.powi(2) + self.constant.unwrap()
    }

    fn next_in_burning_ship(&self, current_item: Complex64, point: &Complex64) -> Complex64 {
        let Complex64 { re, im } = current_item;
        Complex64::new(re.abs(), im.abs()).powi(2) + point
    }

    fn next_in_newton(&self, current_item: Complex64, _: &Complex64) -> Complex64 {
        let nominator = current_item.powi(3) * 2.0 + 1.0;
        let denominator = current_item.powi(2) * 3.0;
        nominator / denominator
    }

    fn in_bounds(&self, point: &Complex64) -> bool {
        let distance = point.re * point.re + point.im * point.im;
        distance < Self::ESCAPE_RADIUS
    }

    pub fn eval(&self, point: Complex64) -> ComplexItem {
        let mut item_id = 0;
        let mut period = 0;
        let mut current_item = point;
        let mut old_item = point;
        while self.in_bounds(&current_item) && item_id < self.max_item_id {
            current_item = (self.next_item)(self, current_item, &point);
            item_id += 1;
            period += 1;

            if current_item == old_item {
                item_id = self.max_item_id;
                break;
            }

            if period >= 20 {
                old_item = current_item;
                period = 0;
            }
        }
        ComplexItem {
            value: current_item,
            index: item_id as f64,
            max_index: self.max_item_id as f64,
        }
    }
}
