use crate::data::FractalVariant;
use num::complex::Complex64;

pub struct ComplexItem {
    pub index: f64,
    pub max_index: f64,
    // Those^ values will eventually be converted to f64,
    // so for simplicity let's do it once
    pub value: Complex64,
}

#[derive(Clone)]
pub struct Fractal {
    max_item_id: u32,
    constant: Option<Complex64>,
    variant: FractalVariant,
}

impl Fractal {
    const ESCAPE_RADIUS: f64 = 8.0;
    pub fn new(max_item_id: u32, variant: FractalVariant) -> Self {
        use FractalVariant::*;
        Self {
            max_item_id,
            variant: variant.clone(),
            constant: match variant {
                JuliaSet(c) => Some(c),
                _ => None,
            },
        }
    }

    fn next_in_mandelbrot(&self, current_item: Complex64, point: &Complex64) -> Complex64 {
        current_item.powi(2) + point
    }

    fn next_in_julia(&self, current_item: Complex64, constant: &Complex64) -> Complex64 {
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
        use FractalVariant::*;
        let next_item = match self.variant {
            BurningShip => Self::next_in_burning_ship,
            Mandelbrot => Self::next_in_mandelbrot,
            Newton => Self::next_in_newton,
            JuliaSet(_) => Self::next_in_julia,
        };

        let mut item_id = 0;
        let mut period = 0;
        let mut current_item = point;
        let mut old_item = point;
        while self.in_bounds(&current_item) && item_id < self.max_item_id {
            current_item = next_item(self, current_item, &point);
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

// #[derive(Clone, Copy)]
// pub struct FractalMandelbrot {
//     pub max_iterations: u32,
// }
// impl Fractal for FractalMandelbrot {
//     fn next_item(&self, current_item: Complex64, point: &Complex64) -> Complex64 {
//         current_item.powi(2) + point
//     }
//     fn max_item_id(&self) -> u32 {
//         self.max_iterations
//     }
// }

// #[derive(Clone, Copy)]
// pub struct FractalJulia {
//     pub max_iterations: u32,
//     pub constant: Complex64,
// }
// impl Fractal for FractalJulia {
//     fn next_item(&self, current_item: Complex64, _: &Complex64) -> Complex64 {
//         current_item.powi(2) + self.constant
//     }
//     fn max_item_id(&self) -> u32 {
//         self.max_iterations
//     }
// }

// #[derive(Clone, Copy)]
// pub struct FractalBurningShip {
//     pub max_iterations: u32,
// }
// impl Fractal for FractalBurningShip {
//     fn next_item(&self, current_item: Complex64, point: &Complex64) -> Complex64 {
//         let Complex64 { re, im } = current_item;
//         Complex64::new(re.abs(), im.abs()).powi(2) + point
//     }
//     fn max_item_id(&self) -> u32 {
//         self.max_iterations
//     }
// }

// #[derive(Clone, Copy)]
// pub struct FractalNewton {
//     pub max_iterations: u32,
// }
// impl Fractal for FractalNewton {
//     fn next_item(&self, current_item: Complex64, _: &Complex64) -> Complex64 {
//         let nominator = current_item.powi(3) * 2.0 + 1.0;
//         let denominator = current_item.powi(2) * 3.0;
//         nominator / denominator
//     }
//     fn max_item_id(&self) -> u32 {
//         self.max_iterations
//     }
// }
