use super::clip;
use crate::data::Rgb;

/// Adapted from https://stackoverflow.com/questions/2353211/hsl-to-rgb-color-conversion

fn hue_to_rgb(p: f64, q: f64, mut t: f64) -> f64 {
    if t < 0.0 {
        t += 1.0
    };
    if t > 1.0 {
        t -= 1.0
    };
    if t < 1.0 / 6.0 {
        return p + (q - p) * 6.0 * t;
    }
    if t < 0.5 {
        return q;
    }
    if t < 2.0 / 3.0 {
        return p + (q - p) * (2.0 / 3.0 - t) * 6.0;
    }
    p
}

pub fn hsl_to_rgb(h: f64, s: f64, l: f64) -> Rgb {
    if s == 0.0 {
        let luma = clip(l * 256.0);
        return Rgb::from([luma, luma, luma]);
    };

    let q = if l < 0.5 {
        l * (1.0 + s)
    } else {
        l + s - l * s
    };
    let p = 2.0 * l - q;
    let r = hue_to_rgb(p, q, h + 1.0 / 3.0);
    let g = hue_to_rgb(p, q, h);
    let b = hue_to_rgb(p, q, h - 1.0 / 3.0);
    Rgb::from([clip(r * 256.0), clip(g * 256.0), clip(b * 256.0)])
}

fn transition(from: f64, to: f64, step: f64) -> f64 {
    let change = to - from;
    from + change * step
}

pub fn gradient(step: f64) -> Rgb {
    let step = step.min(1.0).max(0.0);
    let from = (0.0, 1.0, 0.0);
    let to = (0.2, 1.0, 1.0);
    let (h, s, l) = (
        transition(from.0, to.0, step),
        transition(from.1, to.1, step),
        transition(from.2, to.2, step),
    );
    hsl_to_rgb(h, s, l)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn converts_to_black() {
        let h = 0.0;
        let s = 0.0;
        let l = 0.0;

        let [r, g, b] = hsl_to_rgb(h, s, l).0;
        assert_eq!(r, 0);
        assert_eq!(g, 0);
        assert_eq!(b, 0);
    }

    #[test]
    fn converts_to_red() {
        let h = 0.0;
        let s = 1.0;
        let l = 0.5;

        let [r, g, b] = hsl_to_rgb(h, s, l).0;
        assert!(r > 200, "Not enough red ({r})");
        assert!(g < 5, "Too much green ({g})");
        assert!(b < 5, "Too much blue ({r})");
    }

    #[test]
    fn converts_to_green() {
        let h = 1.0 / 3.0;
        let s = 1.0;
        let l = 0.5;

        let [r, g, b] = hsl_to_rgb(h, s, l).0;
        assert!(r < 5, "Too much red ({r})");
        assert!(g > 200, "Not enough green({g})");
        assert!(b < 5, "Too much blue ({r})");
    }

    #[test]
    fn transition_maintains_bounds() {
        let from = 0.0;
        let to = 40.0;
        let step_start = 0.0;
        let step_end = 1.0;

        let out_start = transition(from, to, step_start);
        let out_end = transition(from, to, step_end);

        assert_eq!(out_start, from);
        assert_eq!(out_end, to);
    }

    #[test]
    fn transition_middle_is_average() {
        let from = 0.0;
        let to = 40.0;
        let step = 0.5;

        let out = transition(from, to, step);

        assert_eq!(out, 20.0);
    }
}
