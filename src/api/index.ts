import { invoke } from "@tauri-apps/api";
import { pixelsToImage } from "./utils";
import { Complex, FractalVariant, store } from "../shared";

// const id = (req: JuliaImageRequest) => {
//   const a = req.bottom_right;
//   const b = req.top_left;
//   return `${a.imaginary} ${a.real} ${b.imaginary} ${b.real}`;
// };

export type JuliaImageRequest = {
  top_left: Complex;
  bottom_right: Complex;
  width_px: number;
};

type FullJuliaImageRequest = JuliaImageRequest & {
  constant: Complex;
  fractal_variant: FractalVariant;
};

export const calcImage = async (req: JuliaImageRequest): Promise<ImageData> => {
  // console.time(`invoke ${id(request)}`);
  const request: FullJuliaImageRequest = {
    ...req,
    constant: { ...store.juliaConstant },
    fractal_variant: "Mandelbrot",
  };
  const pixels = await invoke<number[]>("calc_image", { request });
  // console.timeEnd(`invoke ${id(request)}`);
  // console.time(`transform ${id(request)}`);
  const image = pixelsToImage(pixels, req.width_px);
  // console.timeEnd(`transform ${id(request)}`);
  return image;
};
