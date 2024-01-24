import { fractal } from "./fractal";
import { exportConfig } from "./exportConfig";
import { viewer } from "./viewer";
export type { AppStore } from "./store";
export const store = {
  viewer,
  fractal,
  exportConfig,
};
