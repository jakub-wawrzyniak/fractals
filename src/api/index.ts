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

// const id = (req: JuliaImageRequest) => {
//   const a = req.bottom_right;
//   const b = req.top_left;
//   return `${a.imaginary} ${a.real} ${b.imaginary} ${b.real}`;
// };

export const calcImage = async (
  request: JuliaImageRequest
): Promise<ImageData> => {
  // console.time(`invoke ${id(request)}`);
  const pixels = await invoke<number[]>("calc_image", { request });
  // console.timeEnd(`invoke ${id(request)}`);
  // console.time(`transform ${id(request)}`);
  const image = pixelsToImage(pixels, request.width_px);
  // console.timeEnd(`transform ${id(request)}`);
  return image;
};
