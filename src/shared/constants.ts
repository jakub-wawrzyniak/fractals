import { Complex } from "./types";

export const DEFAULT_ASPECT_RATIO = 1;
export const FRACTAL_VARIANT = ["Mandelbrot", "BurningShip", "Newton"] as const;
export type FractalVariant = (typeof FRACTAL_VARIANT)[number];
type FractalConfig = {
  name: string;
  equation: string;
  allowedRangeInComplex: number;
} & (
  | {
      usesConstant: true;
      defaultConstant: Complex;
    }
  | {
      usesConstant: false;
    }
);

export const FRACTAL_CONFIG = {
  Mandelbrot: {
    name: "Mandelbrot's Set",
    equation: "Zn+1 = Zn^2 + C",
    allowedRangeInComplex: 4,
    usesConstant: true,
    defaultConstant: {
      real: 0.313,
      imaginary: -0.5,
    },
  },
  BurningShip: {
    name: "Burning Ship",
    equation: "Zn+1 = (|Zr| + i|Zi|)^2 + C",
    allowedRangeInComplex: 3,
    usesConstant: true,
    defaultConstant: {
      real: -0.43,
      imaginary: 0.085,
    },
  },
  Newton: {
    name: "Newton's fractal",
    equation: "Zn+1 = (2 * Zn^3 + 1) / 3Zn^2",
    allowedRangeInComplex: 3,
    usesConstant: false,
  },
} as const satisfies Record<FractalVariant, FractalConfig>;
