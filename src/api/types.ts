import { Complex, Fractal } from "../shared";

export type FractalFragment = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
  height_px: number;
};

export type FractalConfig = {
  variant: Fractal;
  max_iterations: number;
  constant: Complex | null;
};

export type FullCalcTileRequest = {
  fragment: FractalFragment;
  fractal: FractalConfig;
};

export type ExportFractalRequest = FullCalcTileRequest & {
  color: string;
  filepath: string;
};
