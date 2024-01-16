pub type Luma = image::Luma<u8>;
pub type Rgb = image::Rgb<u8>;

pub fn clip(input: f64) -> u8 {
    input.round().max(0.0).min(255.0) as u8
}

pub fn sigmoid(arg: f64) -> f64 {
    let denominator = std::f64::consts::E.powf(-arg) + 1.0;
    return 1.0 / denominator;
}

pub fn _squeeze(arg: f64) -> f64 {
    arg / (1.0 + arg)
}

pub fn blend_overlay(bottom: u8, top: u8) -> u8 {
    let bottom = bottom as f64 / 256.0;
    let top = top as f64 / 256.0;
    let blended = if bottom < 0.5 {
        2.0 * bottom * top
    } else {
        1.0 - 2.0 * (1.0 - bottom) * (1.0 - top)
    };
    return clip(blended * 256.0);
}

pub type ColorLUT = [Rgb; 256];
pub fn create_color_lut(color: Rgb) -> ColorLUT {
    let black = image::Rgb::<u8>([0, 0, 0]);
    let mut lut = [black; 256];
    for luma in 0..=255 {
        let r = blend_overlay(luma, color.0[0]);
        let g = blend_overlay(luma, color.0[1]);
        let b = blend_overlay(luma, color.0[2]);
        lut[luma as usize] = image::Rgb([r, g, b]);
    }
    return lut;
}

pub fn hex_to_color(hex: String) -> Rgb {
    let bytes = hex::decode(hex[1..=6].to_owned()).unwrap();
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
