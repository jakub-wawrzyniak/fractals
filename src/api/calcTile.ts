import { invoke } from "@tauri-apps/api";
import { FractalFragment, CalcTileRequest } from "./types";
import { getFractalConfig } from "./utils";

export const calcTile = async (req: FractalFragment): Promise<string> => {
  const request: CalcTileRequest = {
    fragment: req,
    ...getFractalConfig(),
  };

  return await invoke<string>("calc_tile", { request });
};
