import { store } from "../store";
import { CalcTileRequest } from "./types";

export const getFractalConfig = (): Omit<CalcTileRequest, "fragment"> => {
  const { maxIterations, color, ...config } = store.fractal.get;
  return {
    color,
    fractal: {
      ...config,
      max_iterations: maxIterations,
    },
  };
};
