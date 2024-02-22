import { createStore } from "solid-js/store";
import {
  Fractal,
  Complex,
  Point,
  Size,
  INIT_FRACTAL,
  FRACTAL_CONFIG,
  ColoringMethod,
  INIT_COLORING_METHOD,
} from "../shared";

export type AppStore = {
  viewer: Size;
  coloring: {
    color: string;
    method: ColoringMethod;
    antialiasing: boolean;
    brightness: number;
    exponent: number;
  };
  fractal: {
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

const initStore: AppStore = {
  viewer: {
    // this will be overwritten almost instantly
    width: 800,
    height: 600,
  },
  coloring: {
    method: INIT_COLORING_METHOD,
    color: "#ff0000",
    antialiasing: true,
    brightness: 4.0,
    exponent: 1.5,
  },
  fractal: {
    maxIterations: 128,
    variant: INIT_FRACTAL,
    constant: initConstant(INIT_FRACTAL),
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
