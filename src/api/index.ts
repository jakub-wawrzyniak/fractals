import { invoke } from "@tauri-apps/api";
import { pixelsToImage } from "./utils";

export type Complex = {
  imaginary: number;
  real: number;
};

export type JuliaImageRequest = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
};

export const calcImage = async (
  request: JuliaImageRequest
): Promise<ImageData> => {
  console.time("invoke");
  const pixels = await invoke<number[]>("calc_image", { request });
  console.timeEnd("invoke");
  console.time("transform");
  const image = pixelsToImage(pixels, request.width_px);
  console.timeEnd("transform");
  return image;
};
