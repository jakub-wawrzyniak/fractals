import { Complex, Size } from "./types";

export const TILE_SIZE_PX = 512;
export const FRACTALS = [
  "Mandelbrot",
  "JuliaSet",
  "BurningShip",
  "Newton",
] as const;
export const INIT_FRACTAL = FRACTALS[0];
export const INIT_VIEWER_SIZE: Size = {
  width: 800,
  height: 600,
};

export type Fractal = (typeof FRACTALS)[number];
type FractalConfig = {
  name: string;
  equation: string;
  offsetGraphInComplex: Complex;
  description?: string;
  initConstant: Complex | null;
};

const noOffset: Complex = { re: 0, im: 0 };
export const FRACTAL_CONFIG = {
  Mandelbrot: {
    name: "Mandelbrot Set",
    equation: "Zn+1 = Zn^2 + C",
    offsetGraphInComplex: { re: -0.7, im: 0 },
    initConstant: null,
  },
  JuliaSet: {
    name: "Julia Set",
    equation: "Zn+1 = Zn^2 + C",
    offsetGraphInComplex: noOffset,
    initConstant: {
      re: 0.304,
      im: -0.436,
    },
  },
  BurningShip: {
    name: "Burning Ship",
    equation: "Zn+1 = (|Zr| + i|Zi|)^2 + C",
    offsetGraphInComplex: { re: -0.3, im: -0.5 },
    initConstant: null,
  },
  Newton: {
    name: "Newton fractal",
    equation: "Zn+1 = (2 * Zn^3 + 1) / 3Zn^2",
    offsetGraphInComplex: noOffset,
    initConstant: null,
  },
} as const satisfies Record<Fractal, FractalConfig>;
