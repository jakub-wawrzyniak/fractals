import {
  DEFAULT_ASPECT_RATIO,
  FRACTAL_CONFIG,
  FRACTALS,
  Fractal,
} from "./constants";
import { createStore } from "solid-js/store";
import { clip } from "./utils";
import { batch } from "solid-js";
import { Complex, Point } from "./types";

type AppStore = {
  viewerAspectRatio: number;
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

const initConstant = (variant: Fractal) => {
  const constant = FRACTAL_CONFIG[variant].initConstant;
  if (constant === null) return null;
  return { ...constant }; // deep copy, so that the default value will not be overwritten
};

const initFractal = FRACTALS[0];
const initStore: AppStore = {
  viewerAspectRatio: DEFAULT_ASPECT_RATIO, // this will be overwritten onMount
  fractal: {
    color: "#ff0000",
    maxIterations: 1024,
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

const [store, setStore] = createStore(initStore);
export { store };

type Bounds = {
  range: number;
  min: number;
  max: number;
};

export const fractalConfig = () => FRACTAL_CONFIG[store.fractal.variant];
export const imaginaryBounds = (): Bounds => {
  const range = fractalConfig().allowedRangeInComplex / store.viewerAspectRatio;
  return {
    range,
    min: -range / 2,
    max: range / 2,
  };
};

export const realBounds = (): Bounds => {
  const range = fractalConfig().allowedRangeInComplex;
  return {
    range,
    min: -range / 2,
    max: range / 2,
  };
};

export const setConstantImaginary = (value: number) => {
  const { min, max } = imaginaryBounds();
  setStore("fractal", "constant", "imaginary", clip(min, max, value));
};

export const setConstantReal = (value: number) => {
  const { min, max } = realBounds();
  setStore("fractal", "constant", "real", clip(min, max, value));
};

export const setViewerAspectRatio = (ratio: number) => {
  batch(() => {
    setStore("viewerAspectRatio", ratio);
    if (store.fractal.constant !== null) {
      setConstantImaginary(store.fractal.constant.imaginary);
      // ^imaginary constant might go out of bounds on aspectRatio
      // change, must revalidate
    }
  });
};

export const changeFractalVariant = (variant: Fractal) => {
  batch(() => {
    setStore("fractal", "variant", variant);
    setStore("fractal", "constant", initConstant(variant));
  });
};

export const getConstantOrThrow = (where: string) => {
  const { constant, variant } = store.fractal;
  if (constant === null)
    throw `${where}: attempt to access a null-value constant (${variant})`;
  return constant;
};

export const setExportSelectionPoint = (
  name: "start" | "end",
  point: Point
) => {
  setStore("export", "selection", name, point);
};

export const setIsSelecting = (selecting: boolean) => {
  setStore("export", "selection", "isSelecting", selecting);
};

export const setExportSource = (value: AppStore["export"]["source"]) => {
  setStore("export", "source", value);
};

export const setFractalColor = (color: string) => {
  setStore("fractal", "color", color);
};

export const setMaxIterations = (value: number) => {
  setStore("fractal", "maxIterations", value);
};

export const exportAspectRatio = () => {
  const exportScreen = store.export.source === "screen";
  if (exportScreen) return store.viewerAspectRatio;
  const { abs } = Math;
  const { end, start } = store.export.selection;
  const width = abs(end.x - start.x);
  const height = abs(end.y - start.y) / store.viewerAspectRatio;
  return width / height;
};

export const exportHeight = () => {
  return Math.floor(store.export.width / exportAspectRatio());
};

export const setExportHeight = (height: number) => {
  setStore("export", "width", Math.floor(height * exportAspectRatio()));
};

export const setExportWidth = (width: number) => {
  setStore("export", "width", width);
};

export const setExportStatus = (value: AppStore["export"]["status"]) => {
  setStore("export", "status", value);
};
export const setExportProgress = (value: AppStore["export"]["progress"]) => {
  setStore("export", "progress", value);
};
export const setExportFilepath = (value: AppStore["export"]["filepath"]) => {
  setStore("export", "filepath", value);
};
