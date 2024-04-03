import { coloring } from "./coloring";
import { exportConfig } from "./exportConfig";
import { fractal } from "./fractal";
import { viewer } from "./viewer";
export type { AppStore } from "./store";

const getHash = () => {
  const fractalHash = fractal.getFractalHash();
  const colorHash = coloring.getColorHash();
  return fractalHash + "\n" + colorHash;
};

export const store = {
  viewer,
  fractal,
  exportConfig,
  coloring,
  getHash,
};
