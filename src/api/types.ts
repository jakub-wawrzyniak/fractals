import { Complex, Fractal } from "../shared";

export type FractalFragment = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
  height_px: number;
};

export type FractalVariant =
  | {
      type: Omit<Fractal, "JuliaSet">;
    }
  | {
      type: "JuliaSet";
      constant: Complex;
    };

export type ColorMethod =
  | {
      type: "Linear" | "Raw" | "Stripes";
    }
  | {
      type: "Exponential";
      power: number;
    };

export type ColorConfig = {
  brightness: number;
  anti_alias: boolean;
  method: ColorMethod;
  color: {
    hex_start: string;
    hex_end: string;
  };
};

export type FractalConfig = {
  variant: FractalVariant;
  max_iterations: number;
};

export type CalcTileRequest = {
  fragment: FractalFragment;
  fractal: FractalConfig;
  color: ColorConfig;
};

export type ExportFractalRequest = CalcTileRequest & {
  filepath: string;
};
