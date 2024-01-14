import { invoke } from "@tauri-apps/api";
import { pixelsToImage } from "./utils";
import { Complex, Fractal, store } from "../shared";

export type CalcTileRequest = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
};

type FullRequest = CalcTileRequest & {
  constant: Complex;
  fractal_variant: Fractal;
  max_iterations: number;
  color: string;
};

export const calcImage = async (req: CalcTileRequest): Promise<ImageData> => {
  const request: FullRequest = {
    ...req,
    fractal_variant: store.fractal.variant,
    constant: store.fractal.constant ?? { imaginary: 0, real: 0 },
    max_iterations: store.fractal.maxIterations,
    color: store.fractal.color,
  };

  const pixels = await invoke<number[]>("calc_image", { request });
  const image = pixelsToImage(pixels, req.width_px);
  return image;
};
