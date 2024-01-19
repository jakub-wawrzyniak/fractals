import { store } from "../shared";
import { FractalConfig } from "./types";

export const getFractalConfig = (): FractalConfig => {
  const { maxIterations, ...config } = store.fractal;
  return {
    ...config,
    max_iterations: maxIterations,
  };
};
