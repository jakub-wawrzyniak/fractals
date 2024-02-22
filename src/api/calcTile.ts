import { invoke } from "@tauri-apps/api";
import { CalcTileRequest, FractalFragment } from "./types";
import { getColorConfig, getFractalConfig } from "./utils";

export const calcTile = async (req: FractalFragment): Promise<string> => {
  const request: CalcTileRequest = {
    fragment: req,
    fractal: getFractalConfig(),
    color: getColorConfig(),
  };

  return await invoke<string>("calc_tile", { request });
};
