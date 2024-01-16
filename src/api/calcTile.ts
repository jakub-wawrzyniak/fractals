import { invoke } from "@tauri-apps/api";
import { getFractalConfig, pixelsToImage } from "./utils";
import { FractalFragment, FullCalcTileRequest } from "./types";

export const calcTile = async (req: FractalFragment): Promise<ImageData> => {
  const request: FullCalcTileRequest = {
    fragment: req,
    fractal: getFractalConfig(),
  };

  const pixels = await invoke<number[]>("calc_tile", { request });
  const image = pixelsToImage(pixels, req.width_px);
  return image;
};
