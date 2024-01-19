import { invoke } from "@tauri-apps/api";
import { getFractalConfig } from "./utils";
import { FractalFragment, FullCalcTileRequest } from "./types";

export const calcTile = async (req: FractalFragment): Promise<string> => {
  const request: FullCalcTileRequest = {
    fragment: req,
    fractal: getFractalConfig(),
  };

  return await invoke<string>("calc_tile", { request });
};
