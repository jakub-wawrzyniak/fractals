import { invoke } from "@tauri-apps/api";

export type Point = {
  im: number;
  re: number;
};

export type JuliaImageRequest = {
  top_left: Point;
  bottom_right: Point;
  resolution: number;
};

export const calcImage = (request: JuliaImageRequest): Promise<string> => {
  return invoke<string>("calc_image", { request });
};
