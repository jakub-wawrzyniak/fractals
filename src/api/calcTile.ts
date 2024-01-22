import { invoke } from "@tauri-apps/api";
import { getFractalConfig } from "./utils";
import { FractalFragment, FullCalcTileRequest } from "./types";
import { store } from "../shared";

export const calcTile = async (req: FractalFragment): Promise<string> => {
  const request: FullCalcTileRequest = {
    fragment: req,
    fractal: getFractalConfig(),
    color: store.fractal.color,
  };

  return await invoke<string>("calc_tile", { request });
};
