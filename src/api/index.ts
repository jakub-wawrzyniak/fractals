import { invoke } from "@tauri-apps/api";
import { pixelsToImage } from "./utils";
import { Complex, Fractal, store } from "../shared";

export type CalcImageRequest = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
};

type FullRequest = CalcImageRequest & {
  constant: Complex;
  fractal_variant: Fractal;
  max_iterations: number;
};

export const calcImage = async (req: CalcImageRequest): Promise<ImageData> => {
  const request: FullRequest = {
    ...req,
    fractal_variant: store.fractal.variant,
    constant: store.fractal.constant ?? { imaginary: 0, real: 0 },
    max_iterations: store.fractal.maxIterations,
  };

  const pixels = await invoke<number[]>("calc_image", { request });
  const image = pixelsToImage(pixels, req.width_px);
  return image;
};
