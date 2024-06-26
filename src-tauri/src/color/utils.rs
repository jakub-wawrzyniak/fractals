use crate::data::Rgb;

pub fn clip(input: f64) -> u8 {
    input.round().max(0.0).min(255.0) as u8
}

pub fn _normalize(pixel: u8) -> f64 {
    pixel as f64 / 256.0
}

pub fn _sigmoid(arg: f64) -> f64 {
    let denominator = std::f64::consts::E.powf(-arg) + 1.0;
    1.0 / denominator
}

pub fn _squeeze(arg: f64) -> f64 {
    arg / (1.0 + arg)
}

pub fn _ease_fractal(index: f64, max_iterations: f64) -> f64 {
    let arg = index / max_iterations;
    if arg < 0.5 {
        4.0 * arg.powi(3)
    } else {
        1.0 - (-2.0 * arg + 2.0).powi(3) * 0.5
    }
}

pub fn _ease_in_fractal(index: f64, max_iterations: f64) -> f64 {
    let arg = index / max_iterations;
    let output = arg.powi(4);
    output * max_iterations
}

pub fn _blend_channel_overlay(bottom: f64, top: f64) -> u8 {
    let blended = if bottom < 0.5 {
        2.0 * bottom * top
    } else {
        1.0 - 2.0 * (1.0 - bottom) * (1.0 - top)
    };
    clip(blended * 256.0)
}

pub fn _blend_with_color(luma: f64, color: &Rgb) -> Rgb {
    Rgb::from([
        _blend_channel_overlay(luma, _normalize(color[0])),
        _blend_channel_overlay(luma, _normalize(color[1])),
        _blend_channel_overlay(luma, _normalize(color[2])),
    ])
}

pub type _ColorLUT = [Rgb; 256];
pub fn _create_color_lut(color: Rgb) -> _ColorLUT {
    let black = image::Rgb::<u8>([0, 0, 0]);
    let mut lut = [black; 256];
    for luma in 0..=255 {
        let normal = _normalize(luma);
        lut[luma as usize] = _blend_with_color(normal, &color);
    }
    lut
}

pub fn hex_to_color(hex: String) -> Rgb {
    let bytes = hex::decode(&hex[1..=6]).unwrap();
    let color = [bytes[0], bytes[1], bytes[2]];
    image::Rgb(color)
}

#[cfg(test)]
mod tests {
    #[test]
    fn parses_colors() {
        let input = "#ff0000".to_owned();
        let [r, g, b] = super::hex_to_color(input).0;
        assert_eq!(r, 255);
        assert_eq!(g, 0);
        assert_eq!(b, 0);
    }

    #[test]
    #[should_panic]
    fn panics_on_invalid_hex() {
        let input = "#ff000".to_owned();
        super::hex_to_color(input);
    }
}
