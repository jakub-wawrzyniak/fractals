import { invoke } from "@tauri-apps/api";
import { pixelsToImage } from "./utils";
import { Complex, Fractal, store } from "../shared";

export type JuliaImageRequest = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
};

type FullJuliaImageRequest = JuliaImageRequest & {
  constant: Complex;
  fractal_variant: Fractal;
};

export const calcImage = async (req: JuliaImageRequest): Promise<ImageData> => {
  const request: FullJuliaImageRequest = {
    ...req,
    fractal_variant: store.fractalVariant,
    constant: store.fractalConstant ?? { imaginary: 0, real: 0 },
  };

  const pixels = await invoke<number[]>("calc_image", { request });
  const image = pixelsToImage(pixels, req.width_px);
  return image;
};
