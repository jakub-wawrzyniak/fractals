import { createStore } from "solid-js/store";
import {
  FRACTAL_CONFIG,
  FRACTALS,
  Fractal,
  Complex,
  Point,
  Size,
} from "../shared";

export type AppStore = {
  viewer: Size;
  fractal: {
    color: string;
    maxIterations: number;
    constant: Complex | null;
    variant: Fractal;
  };
  export: {
    status:
      | "idle"
      | "done"
      | "exporting"
      | "pickingFilePath"
      | "errorUnknown"
      | "errorBadFileType";
    progress: number;
    filepath: string;
    width: number;
    source: "selection" | "screen";
    selection: {
      isSelecting: boolean;
      start: Point;
      end: Point;
    };
  };
};

export const initConstant = (variant: Fractal) => {
  const constant = FRACTAL_CONFIG[variant].initConstant;
  if (constant === null) return null;
  return { ...constant }; // deep copy, so that the default value will not be overwritten
};

const initFractal = FRACTALS[0];
const initStore: AppStore = {
  viewer: {
    // this will be overwritten almost instantly
    width: 800,
    height: 600,
  },
  fractal: {
    color: "#ff0000",
    maxIterations: 128,
    variant: initFractal,
    constant: initConstant(initFractal),
  },
  export: {
    status: "idle",
    progress: 0,
    filepath: "",
    width: 3000,
    source: "screen",
    selection: {
      isSelecting: false,
      start: {
        x: 0.25,
        y: 0.25,
      },
      end: {
        x: 0.75,
        y: 0.75,
      },
    },
  },
};

export const [__store, __setStore] = createStore(initStore);
