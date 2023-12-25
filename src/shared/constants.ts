import { Complex } from "./types";

export const DEFAULT_ASPECT_RATIO = 1;
export const FRACTALS = [
  "Mandelbrot",
  "JuliaSet",
  "BurningShip",
  "Newton",
] as const;
export type Fractal = (typeof FRACTALS)[number];

type FractalConfig = {
  name: string;
  equation: string;
  allowedRangeInComplex: number;
  description?: string;
  initConstant: Complex | null;
};

export const FRACTAL_CONFIG = {
  Mandelbrot: {
    name: "Mandelbrot's Set",
    equation: "Zn+1 = Zn^2 + C",
    allowedRangeInComplex: 6,
    initConstant: null,
  },
  JuliaSet: {
    name: "Julia Set",
    equation: "Zn+1 = Zn^2 + C",
    allowedRangeInComplex: 4,
    initConstant: {
      real: 0.313,
      imaginary: -0.5,
    },
  },
  BurningShip: {
    name: "Burning Ship",
    equation: "Zn+1 = (|Zr| + i|Zi|)^2 + C",
    allowedRangeInComplex: 3,
    initConstant: null,
  },
  Newton: {
    name: "Newton's fractal",
    equation: "Zn+1 = (2 * Zn^3 + 1) / 3Zn^2",
    allowedRangeInComplex: 3,
    initConstant: null,
  },
} as const satisfies Record<Fractal, FractalConfig>;
